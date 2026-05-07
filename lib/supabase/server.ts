import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Uses service role key — only for server-side API routes, never expose to browser
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
