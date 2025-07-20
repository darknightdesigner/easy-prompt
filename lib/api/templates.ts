/**
 * API layer for template operations
 */

import { supabaseBrowser } from "@/lib/supabaseBrowser"
import type { TemplateData, CreateTemplateFormData, CreateTemplateOptions } from "@/lib/types/template"
import { extractVariables } from "@/lib/prompt-variables"

export class TemplateAPI {
  private static supabase = supabaseBrowser()

  /**
   * Create a new template
   */
  static async create(
    formData: CreateTemplateFormData, 
    options: CreateTemplateOptions = {}
  ): Promise<TemplateData> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User must be authenticated to create templates")
    }

    // Get user's profile ID (required for author_id)
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error("User profile not found. Please try refreshing the page.")
    }

    // Extract variables from template
    const variables = extractVariables(formData.template)
    
    // Generate unique slug from description
    const { data: slugData, error: slugError } = await this.supabase
      .rpc('generate_unique_slug', { base_text: formData.description })

    if (slugError) {
      console.error('Error generating slug:', slugError)
      throw new Error('Failed to generate template URL')
    }

    const templateData: Omit<TemplateData, 'id' | 'created_at' | 'updated_at'> = {
      author_id: profile.id,
      description: formData.description,
      template: formData.template,
      slug: slugData,
      variables,
      status: options.saveAsDraft ? 'draft' : 'published',
      visibility: options.visibility || 'public',
      published_at: options.saveAsDraft ? undefined : new Date().toISOString(),
    }

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .insert(templateData)
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      throw new Error(`Failed to create template: ${error.message}`)
    }

    return data
  }

  /**
   * Get templates for the current user
   */
  static async getUserTemplates(): Promise<TemplateData[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User must be authenticated to fetch templates")
    }

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('author_id', user.id)
      .is('deleted_at', null) // Only get non-deleted templates
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      throw new Error(`Failed to fetch templates: ${error.message}`)
    }

    return data || []
  }

  /**
   * Delete a template (soft delete)
   */
  static async delete(templateId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User must be authenticated to delete templates")
    }

    const { error } = await this.supabase
      .from('prompt_templates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', templateId)
      .eq('author_id', user.id) // Ensure user can only delete their own templates

    if (error) {
      console.error('Error deleting template:', error)
      throw new Error(`Failed to delete template: ${error.message}`)
    }
  }

  /**
   * Update a template
   */
  static async update(
    templateId: string, 
    updates: Partial<CreateTemplateFormData>,
    options?: CreateTemplateOptions
  ): Promise<TemplateData> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User must be authenticated to update templates")
    }

    // If template is being updated, recalculate variables
    const updateData: any = { ...updates }
    if (updates.template) {
      updateData.variables = extractVariables(updates.template)
    }
    
    // If description is being updated, regenerate slug
    if (updates.description) {
      const { data: slugData, error: slugError } = await this.supabase
        .rpc('generate_unique_slug', { base_text: updates.description })
      
      if (!slugError && slugData) {
        updateData.slug = slugData
      }
    }

    // Handle status/visibility updates
    if (options) {
      if (options.saveAsDraft !== undefined) {
        updateData.status = options.saveAsDraft ? 'draft' : 'published'
        updateData.published_at = options.saveAsDraft ? null : new Date().toISOString()
      }
      if (options.visibility) {
        updateData.visibility = options.visibility
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .update(updateData)
      .eq('id', templateId)
      .eq('author_id', user.id) // Ensure user can only update their own templates
      .select()
      .single()

    if (error) {
      console.error('Error updating template:', error)
      throw new Error(`Failed to update template: ${error.message}`)
    }

    return data
  }

  /**
   * Save template as draft (convenience method)
   */
  static async saveDraft(formData: CreateTemplateFormData): Promise<TemplateData> {
    return this.create(formData, { saveAsDraft: true, visibility: 'private' })
  }
}
