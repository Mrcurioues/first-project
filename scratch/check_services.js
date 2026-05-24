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

async function checkServices() {
  const { data: svcs, error: svcsErr } = await supabase.from('services').select('*');
  const { data: arts, error: artsErr } = await supabase.from('service_articles').select('*');

  if (svcsErr) console.error('Services error:', svcsErr);
  if (artsErr) console.error('Service Articles error:', artsErr);

  console.log('Total services in DB:', svcs?.length);
  console.log('Total articles in DB:', arts?.length);

  if (svcs && svcs.length > 0) {
    console.log('Services Sample:', svcs.map(s => ({ id: s.id, category: s.category, tagline: s.tagline })));
  }
  if (arts && arts.length > 0) {
    console.log('Articles Sample:', arts.slice(0, 5).map(a => ({ slug: a.slug, title: a.title, category: a.category })));
  }
}

checkServices();
