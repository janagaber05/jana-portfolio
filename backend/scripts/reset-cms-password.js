import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/reset-cms-password.js your@email.com YourNewPassword');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env');
  console.error('Get the secret key from Supabase → Project Settings → API Keys → secret key');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listError } = await supabase.auth.admin.listUsers();

if (listError) {
  console.error('Could not list users:', listError.message);
  process.exit(1);
}

const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

if (!user) {
  console.error(`No user found for ${email}`);
  console.error('Create the user first in Supabase → Authentication → Users');
  process.exit(1);
}

const { error } = await supabase.auth.admin.updateUserById(user.id, {
  password,
  email_confirm: true,
});

if (error) {
  console.error('Password reset failed:', error.message);
  process.exit(1);
}

console.log(`Password updated for ${email}`);
console.log('Log in at http://localhost:5001/admin with that email and password.');
