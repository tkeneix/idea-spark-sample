// Client-side database operations are handled by API routes
// This file is kept for compatibility but functionality is moved to server-side
export function createClient() {
  throw new Error("Client-side database operations not supported. Use API routes instead.")
}
