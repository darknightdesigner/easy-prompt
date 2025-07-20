/**
 * Utilities for handling return URLs after authentication
 */

const RETURN_URL_KEY = 'authReturnUrl'

/**
 * Store the current URL to return to after authentication
 */
export function storeReturnUrl(url?: string): void {
  if (typeof window === 'undefined') return
  
  const returnUrl = url || window.location.href
  
  // Security: Only store internal URLs to prevent open redirect attacks
  if (isInternalUrl(returnUrl)) {
    localStorage.setItem(RETURN_URL_KEY, returnUrl)
  }
}

/**
 * Get the stored return URL and clear it from storage
 */
export function getAndClearReturnUrl(): string | null {
  if (typeof window === 'undefined') return null
  
  const returnUrl = localStorage.getItem(RETURN_URL_KEY)
  
  if (returnUrl) {
    localStorage.removeItem(RETURN_URL_KEY)
    
    // Security: Validate the URL before returning
    if (isInternalUrl(returnUrl)) {
      return returnUrl
    }
  }
  
  return null
}

/**
 * Clear the stored return URL without returning it
 */
export function clearReturnUrl(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(RETURN_URL_KEY)
}

/**
 * Check if a URL is internal to prevent open redirect attacks
 */
function isInternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const currentOrigin = window.location.origin
    
    // Allow same origin URLs
    if (urlObj.origin === currentOrigin) {
      return true
    }
    
    // Allow relative URLs (they start with /)
    if (url.startsWith('/')) {
      return true
    }
    
    return false
  } catch {
    // If URL parsing fails, treat as external
    return false
  }
}

/**
 * Get a safe fallback URL for redirects
 */
export function getFallbackUrl(): string {
  return '/home'
}
