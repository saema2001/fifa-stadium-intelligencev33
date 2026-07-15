/**
 * Hand-written to match supabase/schema.sql. Once a real Supabase project
 * exists, regenerate this properly with:
 *   npx supabase gen types typescript --project-id <your-project-ref> > src/core/supabase/types.ts
 * and delete this hand-written version.
 */

export type UserRole = "fan" | "volunteer" | "staff" | "organizer";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          display_name?: string | null;
          created_at?: string;
        };
      };
      incidents: {
        Row: {
          id: string;
          zone_id: string;
          incident_type: string;
          notes: string | null;
          reported_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          zone_id: string;
          incident_type: string;
          notes?: string | null;
          reported_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["incidents"]["Insert"]>;
      };
      sensors: {
        Row: {
          id: string;
          zone_id: string;
          metric: string;
          value: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          zone_id: string;
          metric: string;
          value: number;
          recorded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sensors"]["Insert"]>;
      };
      ai_logs: {
        Row: {
          id: string;
          agent_key: string;
          zone_id: string;
          finding: Record<string, unknown>;
          provider: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_key: string;
          zone_id: string;
          finding: Record<string, unknown>;
          provider: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_logs"]["Insert"]>;
      };
    };
  };
}
