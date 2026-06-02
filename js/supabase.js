import { createClient }
from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl =
'https://zinfdszfzpedhvowvole.supabase.co'

const supabaseKey =
'sb_publishable_GFm5vkK0omt46gF-dcfSkg_q8kslt5m'

export const supabase =
createClient(
  supabaseUrl,
  supabaseKey
)

