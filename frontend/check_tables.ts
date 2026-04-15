import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: res, error: err1 } = await supabase.from('reservations').select('*').limit(1);
  console.log('reservations', res, err1);
  
  const { data: pay, error: err2 } = await supabase.from('payments').select('*').limit(1);
  console.log('payments', pay, err2);
}
check();
