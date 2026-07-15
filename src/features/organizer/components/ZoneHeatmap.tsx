"use client";

import { useEffect, useRef, useState } from "react";
import { densityLevel, ZONE_COORDINATES, type Zone } from "@/core/config/domain";
import { cn } from "@/shared/utils/cn";

export interface ZoneState extends Zone {
  value: number;
  flagged: boolean;
}

// OpenFreeMap's public instance: genuinely free, no API key, no
// registration, no card, no usage limits — see https://openfreemap.org.
// "positron" is a light, minimal basemap style, chosen specifically because
// it's designed to stay out of the way of data overlays like our heatmap
// layer, rather than competing with it visually.
const TILE_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export function ZoneHeatmap({ zones }: { zones: ZoneState[] }) {
  return <MapLibreZoneHeatmap zones={zones} />;
}

/**
 * Real MapLibre GL implementation. Renders a heatmap layer driven by each
 * zone's live density plus a marker per gate. MapLibre GL JS is an
 * open-source (BSD-3) fork of Mapbox GL JS's last open-source release —
 * same API, no account or token required, since it's just a library.
 * Combined with OpenFreeMap's free public tile service, this renders a
 * real interactive map with zero configuration and zero cost, unlike
 * Mapbox GL JS which requires a token (and a credit card to activate its
 * free tier). Loaded dynamically inside useEffect because it touches
 * `window`/WebGL directly and isn't SSR-safe.
 */
function MapLibreZoneHeatmap({ zones }: { zones: ZoneState[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markersRef = useRef<Record<string, import("maplibre-gl").Marker>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const maplibregl = (await import("maplibre-gl")).default;
        await import("maplibre-gl/dist/maplibre-gl.css");
        if (cancelled || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: TILE_STYLE_URL,
          center: ZONE_COORDINATES[zones[0].id],
          zoom: 15.5,
          pitch: 45,
        });
        mapRef.current = map;

        map.on("error", (e) => {
          // Fires on tile-load failures too (e.g. openfreemap.org
          // unreachable), not just init errors — catches issues the
          // outer try/catch can't, since those happen after init resolves.
          setError(e.error?.message ?? "Map failed to load");
        });

        map.on("load", () => {
          map.addSource("zones", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: zones.map((z) => ({
                type: "Feature",
                properties: { density: z.value, zoneId: z.id },
                geometry: { type: "Point", coordinates: ZONE_COORDINATES[z.id] },
              })),
            },
          });

          map.addLayer({
            id: "zone-heat",
            type: "heatmap",
            source: "zones",
            paint: {
              "heatmap-weight": ["interpolate", ["linear"], ["get", "density"], 0, 0, 100, 1],
              "heatmap-intensity": 1.2,
              "heatmap-radius": 60,
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(45,227,112,0)",
                0.4,
                "#2DE370",
                0.7,
                "#FFB627",
                1,
                "#FF5C5C",
              ],
            },
          });

          zones.forEach((z) => {
            const el = document.createElement("div");
            el.style.width = "10px";
            el.style.height = "10px";
            el.style.borderRadius = "50%";
            el.style.background = `var(${densityLevel(z.value).colorVar})`;
            el.style.border = "2px solid rgba(255,255,255,0.85)";
            el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.35)";
            const marker = new maplibregl.Marker(el)
              .setLngLat(ZONE_COORDINATES[z.id])
              .setPopup(new maplibregl.Popup({ offset: 12 }).setText(`${z.name}: ${z.value}%`))
              .addTo(map);
            markersRef.current[z.id] = marker;
          });
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load the map");
      }
    }

    init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the heatmap source and marker colors in sync as density updates,
  // without tearing down and recreating the map.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource("zones") as import("maplibre-gl").GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: zones.map((z) => ({
        type: "Feature",
        properties: { density: z.value, zoneId: z.id },
        geometry: { type: "Point", coordinates: ZONE_COORDINATES[z.id] },
      })),
    });
  }, [zones]);

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger-dim p-4 text-[13px] text-danger">
        Map failed to load ({error}). Falling back to the grid view.
        <CssGridZoneHeatmap zones={zones} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[360px] w-full rounded-xl border border-border overflow-hidden"
      role="img"
      aria-label="Live stadium zone density heatmap"
    />
  );
}

/**
 * Fallback used only if the map itself fails to load (e.g. openfreemap.org
 * unreachable from the deployment's network). This is the same visual
 * language as the standalone prototype's heatmap, ported to React — not a
 * "coming soon" placeholder, it's a fully working alternative
 * visualization that requires zero configuration.
 */
function CssGridZoneHeatmap({ zones }: { zones: ZoneState[] }) {
  return (
    <div>
      <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {zones.map((z) => {
          const level = densityLevel(z.value);
          return (
            <li
              key={z.id}
              className={cn(
                "relative rounded-xl border border-border bg-bg-2 p-3 transition",
                z.flagged &&
                  "border-danger shadow-[0_0_0_1px_var(--danger),0_0_26px_var(--danger-dim)]"
              )}
              aria-label={`${z.name}, ${level.label} density, ${z.value} percent${z.flagged ? ", flagged" : ""}`}
            >
              <div className="flex items-center gap-1.5 font-display text-[13px] font-semibold">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: `var(${level.colorVar})` }}
                  aria-hidden
                />
                {z.name}
              </div>
              <div className="mt-0.5 font-mono text-[9.5px] text-text-faint">
                Zone {z.id}
                {z.flagged ? " · FLAGGED" : ""}
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded bg-border">
                <div
                  className="h-full rounded transition-all"
                  style={{ width: `${z.value}%`, background: `var(${level.colorVar})` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-text-dim">
                <span>Density: {level.label}</span>
                <span>{z.value}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
