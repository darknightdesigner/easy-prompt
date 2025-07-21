// Utility functions related to template variable handling

/**
 * Validates if a variable name follows allowed naming conventions.
 * Allows snake_case and camelCase, but no spaces or special characters.
 * 
 * @param name - The variable name to validate
 * @returns true if the name is valid, false otherwise
 * 
 * @example
 * isValidVariableName('user_name') // true
 * isValidVariableName('firstName') // true  
 * isValidVariableName('first name') // false (spaces not allowed)
 * isValidVariableName('user-name') // false (hyphens not allowed)
 */
export function isValidVariableName(name: string): boolean {
  // Allow snake_case and camelCase: start with letter or underscore,
  // followed by letters, numbers, or underscores
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Extracts unique variable names from a prompt template string.
 * Variables use double-brace syntax: {{ variable_name }}
 * 
 * Features:
 * - Whitespace tolerance: {{name}}, {{ name }}, {{ name}} all work
 * - Variable name validation: only snake_case and camelCase allowed
 * - Ignores single braces to avoid conflicts with JSON, code, etc.
 * 
 * @param template - The template string to parse
 * @returns Array of unique variable names found in the template
 * 
 * @example
 * extractVariables('Hello {{ user_name }}, welcome to {{ app_name }}!')
 * // Returns: ['user_name', 'app_name']
 * 
 * extractVariables('JSON: {"key": "value"} and {{ variable }}')
 * // Returns: ['variable'] (ignores single braces)
 */
export function extractVariables(template: string): string[] {
  // Match {{ variable }} with optional whitespace around the variable name
  const regex = /\{\{\s*([^}]+?)\s*\}\}/g;
  const set = new Set<string>();
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(template))) {
    const name = match[1].trim();
    // Only include valid variable names (no spaces, special chars)
    if (name && isValidVariableName(name)) {
      set.add(name);
    }
  }
  
  return Array.from(set);
}
