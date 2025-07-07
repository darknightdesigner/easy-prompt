// Utility functions related to template variable handling

/**
 * Extracts unique variable names from a prompt template string.
 * A variable is identified by curly-brace delimiters, e.g. `{variable_name}`.
 */
export function extractVariables(template: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const set = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(template))) {
    const name = match[1].trim();
    if (name) set.add(name);
  }
  return Array.from(set);
}
