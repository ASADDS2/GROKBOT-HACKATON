import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../shared/types/database'

export function supabaseConfigurado(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL) && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
}

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key',
)
