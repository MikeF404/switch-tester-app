export function sanitizeInput(input: string): string {
  // Removing any HTML tags and trim whitespace
  return input.replace(/<[^>]*>?/gm, "").trim();
}
