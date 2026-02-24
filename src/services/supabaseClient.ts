import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Supabase URL :", supabaseUrl);
console.log("Supabase Key :", supabaseAnonKey ? "présente" : "manquante ⚠️");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetch.bind(globalThis),
  },
});