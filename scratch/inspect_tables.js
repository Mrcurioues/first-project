import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data: cols, error } = await supabase.from('service_articles').select('*').limit(1);
  if (error) {
    console.error('Error fetching service_articles:', error);
  } else if (cols && cols.length > 0) {
    console.log('service_articles columns:', Object.keys(cols[0]));
  }

  const { data: colsSvc, error: errorSvc } = await supabase.from('services').select('*').limit(1);
  if (errorSvc) {
    console.error('Error fetching services:', errorSvc);
  } else if (colsSvc && colsSvc.length > 0) {
    console.log('services columns:', Object.keys(colsSvc[0]));
  }
}

inspect();
