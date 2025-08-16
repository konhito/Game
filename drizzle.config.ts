import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

config({ path: '.env.local' }); // Load .env.local first
config({ path: '.env' }); // Fallback to .env

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
