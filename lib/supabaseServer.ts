import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Returns a Supabase client configured to run on the server
 * with automatic cookie-based auth.
 */
export const supabaseServer = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )
