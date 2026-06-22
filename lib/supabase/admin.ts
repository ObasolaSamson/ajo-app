import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client that uses the service-role key.
 * Bypasses Row Level Security — use only for trusted server-side reads
 * where RLS would block legitimate access (e.g. checking taken slots for
 * a user who is not yet a member of the circle).
 *
 * Falls back to the anon key with a warning if the service-role key is
 * not configured (RLS will then apply, which may cause slot checks to fail).
 *
 * Get the service-role key from:
 *   Supabase Dashboard → Project Settings → API → service_role (secret key)
 * Add to .env.local:  SUPABASE_SERVICE_ROLE_KEY=your_key_here
 * Add to Vercel:      Environment Variables → SUPABASE_SERVICE_ROLE_KEY
 *
 * NEVER import this in client components or expose the key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    console.warn(
      '[createAdminClient] SUPABASE_SERVICE_ROLE_KEY is not set — ' +
      'falling back to anon key. Slot availability checks may be incorrect ' +
      'for non-members due to RLS. Add the key to .env.local and Vercel.'
    )
  }

  const key = serviceKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
