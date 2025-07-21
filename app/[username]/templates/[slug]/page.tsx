"use client";

import { PageContainer } from "@/components/layout/page-container";
import {
  PromptTemplate,
  PromptTemplateTextarea,
} from "@/components/ui/prompt-template";
import { getPromptTemplateBySlug } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Reuse PromptTemplate container styles from home page
const promptContainerStyles = {
  borderClass: "border-b-0 border-primary/8", // e.g. "border-2 border-primary"
  backgroundClass: "bg-transparent", // e.g. "bg-card"
  roundedClass: "rounded-none", // e.g. "rounded-lg"
  paddingClass: "pr-1 pl-1 pt-1 sm:pr-4 sm:pl-4 sm:pt-4" // customize padding
} as const;

interface TemplateData {
  id: string;
  description: string;  // Updated to match new DB schema
  template: string;     // Updated to match new DB schema
  slug: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
  engagement: {
    likes_count: number;
    saves_count: number;
    shares_count: number;
    views_count: number;
  };
  variableQuestions?: Record<string, string>;
}

export default function TemplateDetailPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>();

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPromptTemplateBySlug(slug);
        setTemplate(data as unknown as TemplateData);
      } catch (e) {
        console.error("Error fetching template", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);


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
      <PageContainer.Header className="pt-0 pb-0 px-0 sm:px-0 sm:py-0">
        {loading && (
          <div className="w-full pr-2 pl-2 pt-2 sm:pr-6 sm:pl-6 sm:pt-6 pb-3 animate-pulse space-y-3">
            <div className="flex items-start gap-2">
              <Skeleton className="h-[38px] w-[38px] rounded-full" />
              <div className="flex flex-col pt-1 gap-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-42 w-full rounded-2xl" />
            </div>
            <div className="flex gap-4 mt-2 pb-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-10" />
              ))}
            </div>
          </div>
        )}

        {!loading && template && (
        <PromptTemplate {...promptContainerStyles}
          authorAvatar={template.profiles.avatar_url}
          displayName={template.profiles.display_name}
          username={template.profiles.username}
          title={template.description}  // Updated to use description field
          value={template.template}     // Updated to use template field
          likesCount={template.engagement.likes_count}
          commentsCount={0}
          sharesCount={template.engagement.shares_count}
          savesCount={template.engagement.saves_count}
          verified={false}
          shareUrl={`/${username}/templates/${slug}`}
          initialExpanded={true}
        >
          <PromptTemplateTextarea
            className="w-full resize-none text-base placeholder:text-muted-foreground"
            readOnly
          />
        </PromptTemplate>
      )}
      
      {!loading && !template && (
        <div className="w-full pr-2 pl-2 pt-2 sm:pr-6 sm:pl-6 sm:pt-6 pb-3 text-center">
          <p className="text-muted-foreground">Template not found.</p>
        </div>
      )}

      </PageContainer.Header>

      <section className="py-12 flex justify-center w-full">
        {/* TODO: Load and render template details for {username}/{slug} */}
        <p className="text-muted-foreground">Template detail page coming soon.</p>
      </section>
    </PageContainer>
  );
}
