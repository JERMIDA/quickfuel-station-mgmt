import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;



// Add this debug logging temporarily
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Not set');

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
}

// Create Supabase client with service role key (for backend operations)
export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export default supabase;
