/**
 * Rich text utilities for social media-style content
 * Handles line breaks, URL detection, and hashtag parsing
 */

// URL detection regex - matches http/https URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g

// Hashtag detection regex - matches #hashtag (for future use)
const HASHTAG_REGEX = /#([a-zA-Z0-9_]+)/g

export interface RichTextSegment {
  type: 'text' | 'url' | 'hashtag'
  content: string
  href?: string // For URLs and hashtags
}

/**
 * Parse text content into segments for rich display
 */
export function parseRichText(text: string): RichTextSegment[] {
  if (!text) return []

  const segments: RichTextSegment[] = []
  let lastIndex = 0

  // Find all URLs in the text
  const urlMatches = Array.from(text.matchAll(URL_REGEX))

  for (const match of urlMatches) {
    const url = match[0]
    const startIndex = match.index!

    // Add text before URL
    if (startIndex > lastIndex) {
      const textBefore = text.slice(lastIndex, startIndex)
      if (textBefore) {
        segments.push({
          type: 'text',
          content: textBefore
        })
      }
    }

    // Add URL segment
    segments.push({
      type: 'url',
      content: url,
      href: url
    })

    lastIndex = startIndex + url.length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    if (remainingText) {
      segments.push({
        type: 'text',
        content: remainingText
      })
    }
  }

  // If no URLs found, return the entire text as one segment
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text
    })
  }

  return segments
}

/**
 * Extract hashtags from text (for future tag creation)
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(HASHTAG_REGEX)
  return matches ? matches.map(tag => tag.slice(1)) : [] // Remove # symbol
}

/**
 * Check if text contains URLs
 */
export function hasUrls(text: string): boolean {
  return URL_REGEX.test(text)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize URL for safe display (basic security)
 */
export function sanitizeUrl(url: string): string {
  // Basic sanitization - ensure it starts with http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}
