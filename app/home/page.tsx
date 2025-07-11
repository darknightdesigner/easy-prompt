'use client';

import { useEffect, useState } from 'react';
import { getPromptTemplateFeed, likeTemplate, saveTemplate, shareTemplate } from '@/utils/supabase';
import { PromptTemplate, PromptTemplateTextarea } from '@/components/ui/prompt-template';
import { Button } from '@/components/ui/button';

// Customize PromptTemplate container styles here
const promptContainerStyles = {
  borderClass: "border-b-1", // e.g. "border-2 border-primary"
  backgroundClass: "bg-transparent", // e.g. "bg-card"
  roundedClass: "rounded-none", // e.g. "rounded-lg"
  paddingClass: "pr-4 pl-4 pt-4" // customize padding
} as const;
import { Skeleton } from '@/components/ui/skeleton';

interface Template {
  id: string;
  title: string;
  content: string;
  slug: string;
  visibility?: string;
  created_at?: string;
  profiles: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
  };
  engagements: {
    likes_count: number;
    saves_count: number;
    shares_count: number;
    views_count: number;
  }[];
  template_tags: {
    tags: {
      id: string;
      name: string;
      icon: string;
    };
  }[];
}

// Raw template data from Supabase might have a different structure
interface RawTemplate {
  id: string;
  title: string;
  content: string;
  slug: string;
  visibility?: string;
  created_at?: string;
  // Profiles can be an array or a single object depending on the query
  profiles: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
  } | {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
  }[] | null;
  engagements?: {
    likes_count: number;
    saves_count: number;
    shares_count: number;
    views_count: number;
  }[];
  template_tags?: {
    tags: {
      id: string;
      name: string;
      icon: string;
    };
  }[];
}

// Type guard to check if an object is a Template
function isTemplate(obj: any): obj is Template {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.title === 'string' && 
    typeof obj.content === 'string' && 
    typeof obj.slug === 'string' && 
    obj.profiles && 
    Array.isArray(obj.engagements);
}

// Convert raw template data to our Template interface
function normalizeTemplate(template: RawTemplate): Template {
  // Extract profile data safely regardless of structure
  let profileData = {
    id: '',
    display_name: '',
    username: '',
    avatar_url: ''
  };
  
  if (template.profiles) {
    // Check if profiles is an array
    if (Array.isArray(template.profiles) && template.profiles.length > 0) {
      const profile = template.profiles[0];
      profileData = {
        id: profile.id || '',
        display_name: profile.display_name || '',
        username: profile.username || '',
        avatar_url: profile.avatar_url || ''
      };
    } 
    // Check if profiles is a single object
    else if (typeof template.profiles === 'object') {
      profileData = {
        id: (template.profiles as any).id || '',
        display_name: (template.profiles as any).display_name || '',
        username: (template.profiles as any).username || '',
        avatar_url: (template.profiles as any).avatar_url || ''
      };
    }
  }
  
  return {
    id: template.id,
    title: template.title,
    content: template.content,
    slug: template.slug,
    visibility: template.visibility,
    created_at: template.created_at,
    profiles: profileData,
    engagements: template.engagements || [{
      likes_count: 0,
      saves_count: 0,
      shares_count: 0,
      views_count: 0
    }],
    template_tags: template.template_tags || []
  };
}

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'created_at' | 'likes_count' | 'views_count'>('created_at');
  
  useEffect(() => {
    async function loadTemplates() {
      try {
        setLoading(true);
        const { templates, count } = await getPromptTemplateFeed({ 
          page, 
          sortBy 
        });
        
        // Normalize the templates to match our Template interface
        const validTemplates = templates.map(template => normalizeTemplate(template as unknown as RawTemplate));
        
        if (page === 1) {
          setTemplates(validTemplates);
        } else {
          setTemplates(prev => [...prev, ...validTemplates]);
        }
        
        // Check if we've loaded all available templates
        setHasMore(templates.length > 0 && (page * 10) < (count || 0));
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadTemplates();
  }, [page, sortBy]);
  
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleLike = async (templateId: string) => {
    const result = await likeTemplate(templateId);
    if (result.success) {
      // Update local state for immediate feedback
      setTemplates(prev => 
        prev.map(template => {
          if (template.id === templateId) {
            return {
              ...template,
              engagements: [{
                ...template.engagements[0],
                likes_count: (template.engagements[0]?.likes_count || 0) + 1
              }]
            } as Template;
          }
          return template;
        })
      );
    }
  };

  const handleSave = async (templateId: string) => {
    const result = await saveTemplate(templateId);
    if (result.success) {
      // Update local state for immediate feedback
      setTemplates(prev => 
        prev.map(template => {
          if (template.id === templateId) {
            return {
              ...template,
              engagements: [{
                ...template.engagements[0],
                saves_count: (template.engagements[0]?.saves_count || 0) + 1
              }]
            } as Template;
          }
          return template;
        })
      );
    }
  };

  const handleShare = async (templateId: string) => {
    const result = await shareTemplate(templateId);
    if (result.success) {
      // Update local state for immediate feedback
      setTemplates(prev => 
        prev.map(template => {
          if (template.id === templateId) {
            return {
              ...template,
              engagements: [{
                ...template.engagements[0],
                shares_count: (template.engagements[0]?.shares_count || 0) + 1
              }]
            } as Template;
          }
          return template;
        })
      );
    }
  };
  
  return (
    <div className="container mx-auto sm:max-w-[44rem]">
      <div className="flex flex-col gap-6 pt-32 border-l-1 border-r-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prompt Templates</h1>
        <div className="flex gap-2">
          <Button 
            variant={sortBy === 'created_at' ? 'default' : 'outline'} 
            onClick={() => {
              setSortBy('created_at');
              setPage(1);
            }}
            size="sm"
          >
            Latest
          </Button>
          <Button 
            variant={sortBy === 'likes_count' ? 'default' : 'outline'} 
            onClick={() => {
              setSortBy('likes_count');
              setPage(1);
            }}
            size="sm"
          >
            Popular
          </Button>
          <Button 
            variant={sortBy === 'views_count' ? 'default' : 'outline'} 
            onClick={() => {
              setSortBy('views_count');
              setPage(1);
            }}
            size="sm"
          >
            Most Viewed
          </Button>
        </div>
      </div>
      
      {loading && page === 1 ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-24 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 && !loading ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No templates found</p>
        </div>
      ) : (
        <div className="space-y-0">
          {templates.map(template => (
            <PromptTemplate
              {...promptContainerStyles}
              key={template.id}
              authorAvatar={template.profiles?.avatar_url || ""}
              displayName={template.profiles?.display_name || ""}
              username={template.profiles?.username || ""}
              title={template.title}
              likesCount={template.engagements?.[0]?.likes_count || 0}
              commentsCount={0} // You can add this later
              sharesCount={template.engagements?.[0]?.shares_count || 0}
              savesCount={template.engagements?.[0]?.saves_count || 0}
              verified={false} // Add this field to your database if needed
              shareUrl={`/templates/${template.slug}`}
              value={template.content}
              onLike={() => handleLike(template.id)}
              onSave={() => handleSave(template.id)}
              onShare={() => handleShare(template.id)}
            >
              <PromptTemplateTextarea
                className="w-full resize-none text-base placeholder:text-muted-foreground"
                readOnly
              />
            </PromptTemplate>
          ))}
          
          {hasMore && (
            <div className="text-center py-4">
              <Button
                onClick={loadMore}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
}
