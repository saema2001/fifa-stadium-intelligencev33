import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateFindingSafely } from "@/core/ai";
import { AGENTS, INCIDENT_TYPES, ZONES } from "@/core/config/domain";

// Every field is validated against the fixed, known-good domain config
// below — nothing here is trusted just because it parsed as JSON. This is
// the request-validation half of prompt-injection protection: reject
// anything that isn't one of our own zone IDs / agent keys / incident keys
// before it ever reaches buildAgentPrompt().
const RequestSchema = z.object({
  agentKey: z.enum(AGENTS.map((a) => a.key) as [string, ...string[]]),
  zoneId: z.enum(ZONES.map((z) => z.id) as [string, ...string[]]),
  currentDensity: z.number().min(0).max(100),
  incidentKey: z.enum(Object.keys(INCIDENT_TYPES) as [string, ...string[]]),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { agentKey, zoneId, currentDensity, incidentKey } = parsed.data;
  const zone = ZONES.find((z) => z.id === zoneId);
  const incident = INCIDENT_TYPES[incidentKey as keyof typeof INCIDENT_TYPES];
  if (!zone || !incident) {
    // Unreachable given the enum validation above, but fail closed anyway.
    return NextResponse.json({ error: "Unknown zone or incident" }, { status: 400 });
  }

  const finding = await generateFindingSafely({
    agentKey: agentKey as (typeof AGENTS)[number]["key"],
    zone,
    currentDensity,
    incidentLabel: incident.label,
  });

  return NextResponse.json(finding);
}
