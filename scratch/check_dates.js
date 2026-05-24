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

async function check() {
  const { data, error } = await supabase.from('appointments').select('*');
  if (error) {
    console.error('Error fetching appointments:', error);
    return;
  }
  console.log('Total appointments:', data.length);
  const badDates = data.filter(a => {
    if (!a.scheduled_at) return true;
    const d = new Date(a.scheduled_at);
    return isNaN(d.getTime());
  });
  console.log('Appointments with bad or empty scheduled_at:', badDates.length);
  if (badDates.length > 0) {
    console.log('Sample bad dates:', badDates.slice(0, 10).map(a => ({ id: a.id, scheduled_at: a.scheduled_at, patient_name: a.patient_name })));
  } else {
    console.log('All scheduled_at dates are valid!');
  }
}

check();
