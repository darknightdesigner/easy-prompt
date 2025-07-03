import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/profile/profile-card";

export default async function MyProfilePage() {
  const supabase = supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/me");
  }

  // ensure profile row exists; if not, create default
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, username, bio, avatar_url")
    .eq("id", session.user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // no row, insert default
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({ id: session.user.id, display_name: session.user.email, username: session.user.email.split("@")[0] })
      .select("display_name, username, bio, avatar_url")
      .single();
    return (
      <section className="py-16 flex justify-center">
        <ProfileCard
          displayName={newProfile!.display_name}
          username={newProfile!.username}
          bio={newProfile!.bio}
          avatarUrl={newProfile!.avatar_url}
        />
      </section>
    );
  }

  return (
    <section className="py-16 flex justify-center">
      <ProfileCard
        displayName={profile!.display_name}
        username={profile!.username}
        bio={profile!.bio}
        avatarUrl={profile!.avatar_url}
      />
    </section>
  );
}
