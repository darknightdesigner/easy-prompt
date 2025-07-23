import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/profile/profile-card";
import { PageContainer } from "@/components/layout/page-container";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }>; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { username } = await params;

  const supabase = await supabaseServer();
  
  // Get current session to check if user is viewing their own profile
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get the profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, bio, avatar_url")
    .eq("username", username)
    .single();

  if (!profile) {
    redirect("/404");
  }

  // Check if this is the current user's own profile
  const isOwnProfile = session?.user?.id === profile.id;

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
          isOwnProfile={isOwnProfile}
        />
      </section>
    </PageContainer>
  );
}
