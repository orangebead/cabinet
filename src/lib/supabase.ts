import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const ak = import.meta.env.VITE_NONA_SUPABASE

export const supabase = createClient(supabaseUrl, ak)