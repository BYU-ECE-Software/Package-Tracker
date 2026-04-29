// Prisma 6+ config file. Replaces the deprecated `prisma` block in
// package.json (removed in Prisma 7). See https://pris.ly/prisma-config.
//
// `dotenv/config` is imported up front because Prisma stops auto-loading
// `.env` when a config file is present, and the schema's
// datasource still reads DATABASE_URL via `env(...)`.

import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
