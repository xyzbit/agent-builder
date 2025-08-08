// @ts-nocheck
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const isProduction = process.env.ENV === 'production';

export default defineConfig({
  out: 'app/drizzle',
  schema: 'app/drizzle/schema/*',
  dialect: 'postgresql',
  // ...(isProduction ? {} : { driver: 'pglite' }),
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});