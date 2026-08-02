import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: vData, error: vError } = await supabase.from('product_variants').select('*').limit(1);
  if (vError) {
    console.log('No product_variants table:', vError.message);
  } else {
    console.log('product_variants table exists:', vData);
  }
  
  const { data: oData, error: oError } = await supabase.from('product_options').select('*').limit(1);
  if (oError) {
    console.log('No product_options table:', oError.message);
  } else {
    console.log('product_options table exists:', oData);
  }

  process.exit(0);
}

check();
