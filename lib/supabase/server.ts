import { getPool } from '../postgresql'

export async function createClient() {
  return getPool()
}

export { createClient as createServerClient }
