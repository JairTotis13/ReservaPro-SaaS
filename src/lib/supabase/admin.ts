import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let singletonAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!singletonAdmin) {
    singletonAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return singletonAdmin;
}

export const supabaseAdmin = getSupabaseAdmin();
