import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/profile/profile-card";

interface Props {
  params: { username: string };
}

export default async function PublicProfilePage({ params }: Props) {
  const supabase = supabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, bio, avatar_url")
    .eq("username", params.username)
    .single();

  if (!profile) {
    redirect("/404");
  }

  return (
    <section className="py-16 flex justify-center">
      <ProfileCard
        displayName={profile.display_name}
        username={profile.username}
        bio={profile.bio}
        avatarUrl={profile.avatar_url}
      />
    </section>
  );
}
