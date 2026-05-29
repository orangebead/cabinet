import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.NONA_SUPABASE

export const supabase = createClient(supabaseUrl, supabaseAnonKey)