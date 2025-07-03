import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'


/**
 * Returns a Supabase client configured to run on the server
 * with automatic cookie-based auth.
 */
export const supabaseServer = async () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          /* read-only in RSC */
        },
        remove() {
          /* read-only in RSC */
        },
      },
    }
  );
}
