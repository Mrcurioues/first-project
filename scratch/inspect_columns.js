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

async function inspectColumns() {
  // Let's try selecting specific columns
  const cols = ["id", "doctor_id", "shift_date", "day_of_week", "start_time", "end_time", "is_active"];
  for (const col of cols) {
    const { data, error } = await supabase.from("doctor_shifts").select(col).limit(1);
    if (error) {
      console.log(`Column [${col}] does NOT exist or failed:`, error.message);
    } else {
      console.log(`Column [${col}] exists!`);
    }
  }
}

inspectColumns();
