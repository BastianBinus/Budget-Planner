import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when Supabase env vars are configured. Until then (Phase 0) the app
 * runs without a backend so the shell can be developed and previewed.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase ist noch nicht konfiguriert. Lege VITE_SUPABASE_URL und ' +
      'VITE_SUPABASE_ANON_KEY in einer .env-Datei an (siehe .env.example).',
  );
}

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'public-anon-key');
