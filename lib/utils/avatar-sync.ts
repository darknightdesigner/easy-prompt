/**
 * Utilities for syncing OAuth profile images to user profiles
 */

import { supabaseBrowser } from "@/lib/supabaseBrowser";

/**
 * Validate if a URL is a valid Google image URL
 */
export function isValidGoogleImageUrl(url: string): boolean {
  if (!url) return false;
  
  const googleDomains = [
    'lh3.googleusercontent.com',
    'ci3.googleusercontent.com',
    'lh1.googleusercontent.com',
    'lh2.googleusercontent.com',
    'lh4.googleusercontent.com',
    'lh5.googleusercontent.com',
    'lh6.googleusercontent.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return googleDomains.includes(urlObj.hostname) || 
           urlObj.hostname.endsWith('.googleusercontent.com');
  } catch {
    return false;
  }
}

/**
 * Extract avatar URL from Supabase auth user metadata with validation
 */
export function extractAvatarFromAuthUser(user: any): string | null {
  if (!user) return null;

  const { user_metadata, raw_user_metadata } = user;
  
  // Try various possible locations where OAuth providers store avatar URLs
  const potentialAvatars = [
    raw_user_metadata?.avatar_url,
    raw_user_metadata?.picture,
    user_metadata?.avatar_url,
    user_metadata?.picture,
    raw_user_metadata?.profile_picture,
    user_metadata?.profile_picture
  ];
  
  // Find the first valid avatar URL
  for (const avatar of potentialAvatars) {
    if (avatar && typeof avatar === 'string') {
      // For now, we primarily support Google images, but this can be extended
      if (isValidGoogleImageUrl(avatar)) {
        return avatar;
      }
      // For other providers, do basic URL validation
      try {
        new URL(avatar);
        return avatar;
      } catch {
        continue;
      }
    }
  }

  return null;
}

/**
 * Extract display name from auth user metadata
 */
export function extractDisplayNameFromAuthUser(user: any): string | null {
  if (!user) return null;

  const { user_metadata, raw_user_metadata, email } = user;
  
  const displayName = 
    raw_user_metadata?.full_name ||
    raw_user_metadata?.name ||
    user_metadata?.full_name ||
    user_metadata?.name ||
    email ||
    null;

  return displayName;
}

/**
 * Determine avatar source from URL
 */
export function getAvatarSource(avatarUrl: string | null): 'google' | 'github' | 'facebook' | 'upload' | 'default' {
  if (!avatarUrl) return 'default';
  
  if (isValidGoogleImageUrl(avatarUrl)) return 'google';
  if (avatarUrl.includes('avatars.githubusercontent.com')) return 'github';
  if (avatarUrl.includes('graph.facebook.com') || avatarUrl.includes('platform-lookaside.fbsbx.com')) return 'facebook';
  if (avatarUrl.startsWith('/') || avatarUrl.includes('your-domain.com')) return 'upload';
  
  return 'upload'; // Default for custom uploads
}

/**
 * Sync current user's avatar from OAuth provider to profile with metadata
 */
export async function syncCurrentUserAvatar(): Promise<{ success: boolean; error?: string; updated?: boolean }> {
  try {
    const supabase = supabaseBrowser();
    
    // Get current user with metadata
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get current profile to compare
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('avatar_url, avatar_updated_at, avatar_source')
      .eq('id', user.id)
      .single();

    // Extract avatar URL and display name
    const newAvatarUrl = extractAvatarFromAuthUser(user);
    const displayName = extractDisplayNameFromAuthUser(user);

    if (!newAvatarUrl && !displayName) {
      return { success: false, error: "No avatar or display name found in auth metadata" };
    }

    // Check if avatar actually changed
    const avatarChanged = !!(newAvatarUrl && newAvatarUrl !== currentProfile?.avatar_url);
    
    // Update profile with extracted data
    const updateData: any = {};
    if (newAvatarUrl) {
      updateData.avatar_url = newAvatarUrl;
      updateData.avatar_source = getAvatarSource(newAvatarUrl);
      updateData.avatar_updated_at = new Date().toISOString();
    }
    if (displayName) updateData.display_name = displayName;

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, updated: avatarChanged };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Sync avatar for a specific user (admin function)
 */
export async function syncUserAvatar(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseBrowser();
    
    // Call the database function to extract and update avatar
    const { data, error } = await supabase.rpc('extract_avatar_url_from_auth_user', {
      auth_user_id: userId
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data) {
      // Update the profile with the extracted avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data })
        .eq('id', userId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Check if user has OAuth avatar available
 */
export async function hasOAuthAvatar(): Promise<boolean> {
  try {
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const avatarUrl = extractAvatarFromAuthUser(user);
    return !!avatarUrl;
  } catch {
    return false;
  }
}
