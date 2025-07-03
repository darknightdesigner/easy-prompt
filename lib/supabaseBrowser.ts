import { createBrowserClient } from '@supabase/ssr'

/**
 * Returns a per-request browser Supabase client that stores the session
 * in first-party cookies (managed automatically by @supabase/ssr).
 */
export const supabaseBrowser = () =>
  createBrowserClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY)!
  )
