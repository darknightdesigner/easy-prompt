import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'


/**
 * Returns a Supabase client configured to run on the server
 * with automatic cookie-based auth.
 */
export const supabaseServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          // @ts-ignore - type mismatch between runtimes
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options?: any) {
          // @ts-ignore
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
}
