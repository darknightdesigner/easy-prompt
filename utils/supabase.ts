import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getPromptTemplateFeed({
  page = 1,
  limit = 10,
  userId,
  tagId,
  sortBy = 'created_at'
}: {
  page?: number;
  limit?: number;
  userId?: string;
  tagId?: string;
  sortBy?: 'created_at' | 'likes_count' | 'views_count';
}) {
  let query = supabase
    .from('prompt_templates')
    .select(`
      id, 
      title, 
      content, 
      slug, 
      visibility,
      created_at,
      profiles:author_id (id, display_name, username, avatar_url),
      engagements (likes_count, saves_count, shares_count, views_count),
      template_tags (
        tags (id, name, icon)
      )
    `, { count: 'exact' })
    .eq('visibility', 'public')
    .eq('status', 'published')
    .is('deleted_at', null);

  // Filter by user if provided
  if (userId) {
    query = query.eq('author_id', userId);
  }
  
  // Filter by tag if provided
  if (tagId) {
    query = query.eq('template_tags.tag_id', tagId);
  }
  
  // Sort by the specified field
  if (sortBy === 'likes_count') {
    query = query.order('engagements.likes_count', { ascending: false });
  } else if (sortBy === 'views_count') {
    query = query.order('engagements.views_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    templates: data || [],
    count
  };
}

export async function getPromptTemplate(id: string) {
  const { data: template, error: templateError } = await supabase
    .from('prompt_templates')
    .select(`
      id, title, content, slug, visibility,
      profiles:author_id (id, display_name, username, avatar_url)
    `)
    .eq('id', id)
    .single();
    
  if (templateError) throw templateError;
  
  // Get template variables
  const { data: variables, error: variablesError } = await supabase
    .from('template_variables')
    .select('name, question, default_value')
    .eq('template_id', id);
    
  if (variablesError) throw variablesError;
  
  // Get engagement metrics
  const { data: engagement, error: engagementError } = await supabase
    .from('engagements')
    .select('likes_count, saves_count, shares_count, views_count')
    .eq('template_id', id)
    .single();
    
  // If no engagement record exists yet, use default values
  const engagementData = engagement || {
    likes_count: 0,
    saves_count: 0,
    shares_count: 0,
    views_count: 0
  };
  
  // Convert variables to the format expected by PromptTemplate
  const variableQuestions = variables?.reduce((acc, v) => {
    acc[v.name] = v.question || `Enter ${v.name.replace(/_/g, " ")}`;
    return acc;
  }, {} as Record<string, string>);
  
  // Increment view count
  await supabase.rpc('increment_template_view', { template_id: id });
  
  return {
    ...template,
    variables,
    variableQuestions,
    engagement: engagementData
  };
}

// Function to extract variables from template content
export function extractVariables(content: string): string[] {
  const variableRegex = /\{([^{}]+)\}/g;
  const matches = content.match(variableRegex) || [];
  return matches.map(match => match.slice(1, -1));
}

// Function to like a template
export async function likeTemplate(templateId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { success: false, message: 'User not authenticated' };
  
  const { error } = await supabase
    .from('user_interactions')
    .upsert({
      user_id: userData.user.id,
      template_id: templateId,
      liked: true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,template_id',
      ignoreDuplicates: false
    });
  
  if (error) return { success: false, message: error.message };
  
  // Increment like count
  await supabase.rpc('increment_template_likes', { template_id: templateId });
  
  return { success: true };
}

// Function to save a template
export async function saveTemplate(templateId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { success: false, message: 'User not authenticated' };
  
  const { error } = await supabase
    .from('user_interactions')
    .upsert({
      user_id: userData.user.id,
      template_id: templateId,
      saved: true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,template_id',
      ignoreDuplicates: false
    });
  
  if (error) return { success: false, message: error.message };
  
  // Increment save count
  await supabase.rpc('increment_template_saves', { template_id: templateId });
  
  return { success: true };
}

// Function to share a template
export async function shareTemplate(templateId: string) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  
  let error = null;
  
  // Track share event if user is logged in
  if (userId) {
    const result = await supabase
      .from('user_interactions')
      .upsert({
        user_id: userId,
        template_id: templateId,
        shared: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,template_id',
        ignoreDuplicates: false
      });
    
    error = result.error;
  }
  
  // Increment share count even if not logged in
  await supabase.rpc('increment_template_shares', { template_id: templateId });
  
  return { success: !error };
}
