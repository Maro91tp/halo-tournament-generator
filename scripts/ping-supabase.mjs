import { existsSync, readFileSync } from 'node:fs';

const ENV_FILE = new URL('../.env', import.meta.url);
const KEEPALIVE_ID = 1;

function loadLocalEnv() {
  if (!existsSync(ENV_FILE)) return;

  const lines = readFileSync(ENV_FILE, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const [rawKey, ...rawValueParts] = trimmed.split('=');
    const key = rawKey.trim();
    const value = rawValueParts.join('=').trim().replace(/^['"]|['"]$/g, '');

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getRequiredEnv(name, fallbackName) {
  const value = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);

  if (!value) {
    const fallbackHint = fallbackName ? ` or ${fallbackName}` : '';
    throw new Error(`Missing ${name}${fallbackHint}. Add it to GitHub secrets or .env.`);
  }

  return value;
}

function normalizeSupabaseUrl(url) {
  return url.replace(/\/+$/, '');
}

async function pingSupabase() {
  loadLocalEnv();

  const supabaseUrl = normalizeSupabaseUrl(getRequiredEnv('SUPABASE_URL', 'PUBLIC_SUPABASE_URL'));
  const supabaseAnonKey = getRequiredEnv('SUPABASE_ANON_KEY', 'PUBLIC_SUPABASE_ANON_KEY');
  const pingedAt = new Date().toISOString();

  const response = await fetch(`${supabaseUrl}/rest/v1/app_keepalive?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: KEEPALIVE_ID,
      last_ping: pingedAt,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase keepalive failed (${response.status}): ${details}`);
  }

  console.log(`Supabase keepalive ping OK: ${KEEPALIVE_ID} at ${pingedAt}`);
}

pingSupabase().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
