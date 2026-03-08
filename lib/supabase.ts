import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://difjxwljashhpkqgjjde.supabase.co'
const supabaseKey = 'sb_publishable_pzGUgQvfCUX7_TTwcz6wXA_1hBgxs95'

export const supabase = createClient(supabaseUrl, supabaseKey)