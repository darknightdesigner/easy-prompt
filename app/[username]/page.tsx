import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/profile/profile-card";
import { PageContainer } from "@/components/layout/page-container";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }>; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { username } = await params;

  const supabase = await supabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, bio, avatar_url")
    .eq("username", username)
    .single();

  if (!profile) {
    redirect("/404");
  }

  return (
    <PageContainer
      background={{
        wavy: true,
        animation: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 3, delay: 1 },
        },
      }}
    >
      <section className="py-16 flex justify-center">
        <ProfileCard
          displayName={profile.display_name}
          username={profile.username}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
        />
      </section>
    </PageContainer>
  );
}
