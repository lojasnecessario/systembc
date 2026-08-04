const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const dbMatch = env.match(/VITE_SUPABASE_URL=([^\n\r]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\n\r]+)/);
const sbUrl = dbMatch[1].replace(/['"]/g, '').trim();
const sbKey = keyMatch[1].replace(/['"]/g, '').trim();

const supabase = createClient(sbUrl, sbKey);
supabase.from('products').select('*').then(({data, error}) => {
  console.log(JSON.stringify(data, null, 2));
});
