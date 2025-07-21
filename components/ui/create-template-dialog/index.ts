/**
 * Barrel exports for Create Template Dialog
 * Provides clean import interface for consumers
 */

// Main dialog components
export { CreateTemplateDialog } from "./create-template-dialog"
export { CreateTemplateDialogProvider, useCreateTemplate } from "./create-template-context"

// Step components
export { StepDescription } from "./steps/step-description"
export { StepTemplate } from "./steps/step-template"
export { StepPreview } from "./steps/step-preview"

// Navigation components
export { StepNavigation } from "./components/step-navigation"
export { PreviewIcons } from "./components/preview-icons"
export { AddVariablePopover } from "./components/add-variable-popover"

// Types
export type { 
  CreateTemplateFormData, 
  CreateTemplateState, 
  CreateTemplateContextType,
  CreateTemplateOptions 
} from "@/lib/types/template"
