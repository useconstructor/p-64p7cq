import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;

export const db = createClient({
  url: url || 'file:local.db',
  authToken: url ? process.env.TURSO_AUTH_TOKEN : undefined,
});
