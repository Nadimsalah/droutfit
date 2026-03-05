import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dvbuiiaymvynzwecefup.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_wZP6zXeZMZhgLZvtIJQJyg_etZjp1Hs";

export const supabase = createClient(supabaseUrl, supabaseKey);
