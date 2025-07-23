"use client";

import { useEffect, useState } from "react";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

export function useCurrentUsername() {
  const { session } = useSessionContext();
  const supabase = useSupabaseClient();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsername() {
      if (!session?.user?.id) {
        setUsername(null);
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();

        if (error && error.code === "PGRST116") {
          // No profile exists, create default
          const defaultUsername = (session.user.email ?? session.user.id).split("@")[0];
          await supabase
            .from("profiles")
            .insert({ 
              id: session.user.id, 
              display_name: session.user.email ?? session.user.id, 
              username: defaultUsername 
            });
          setUsername(defaultUsername);
        } else {
          setUsername(profile?.username || null);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUsername();
  }, [session?.user?.id, session?.user?.email, supabase]);

  return { username, loading };
}
