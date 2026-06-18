import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

let singletonClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (typeof window === 'undefined') {
    return createClient();
  }
  if (!singletonClient) {
    singletonClient = createClient();
  }
  return singletonClient;
}

export const supabase = getSupabaseBrowser();
