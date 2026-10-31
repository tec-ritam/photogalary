import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  "https://ioojwbryftvwpvlcnskq.supabase.co";

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvb2p3YnJ5ZnR2d3B2bGNuc2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTE4ODEsImV4cCI6MjEwODg2Nzg4MX0.jqogcJ_-O8F4r1Vl3YXRejnF9PLba18Q4TlPiEPUslk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
