import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'


/**
 * Returns a Supabase client configured to run on the server
 * with automatic cookie-based auth.
 */
export const supabaseServer = () => {
  // Cast to any to work around differing build-time types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookieStore: any = cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
        return cookieStore.get(name)?.value
      },
        set(name: string, value: string, options?: any) {
        // @ts-ignore - cookieStore types differ between runtime and build
        cookieStore.set({ name, value, ...options })
      },
        remove(name: string, options?: any) {
        // @ts-ignore
        cookieStore.delete({ name, ...options })
      },
      },
    }
  );
}
