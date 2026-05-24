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

async function checkQueries() {
  const queries = [
    { name: "appointments", query: () => supabase.from("appointments").select("*").limit(5) },
    { name: "patients", query: () => supabase.from("patients").select("id, full_name, phone, created_at").limit(5) },
    { name: "billing_invoices", query: () => supabase.from("billing_invoices").select("*").limit(5) },
    { name: "payment_transactions", query: () => supabase.from("payment_transactions").select("*").limit(5) },
    { name: "doctors", query: () => supabase.from("doctors").select("*").eq("active", true).limit(5) },
    { name: "calendar_blockings", query: () => supabase.from("calendar_blockings").select("*").limit(5) }
  ];

  for (const q of queries) {
    try {
      const { data, error } = await q.query();
      if (error) {
        console.error(`Query [${q.name}] failed:`, error.message, error);
      } else {
        console.log(`Query [${q.name}] success: found ${data.length} records`);
      }
    } catch (err) {
      console.error(`Query [${q.name}] threw exception:`, err);
    }
  }
}

checkQueries();
