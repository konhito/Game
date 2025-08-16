import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';

config({ path: ".env.local" }); // Load .env.local first
config({ path: ".env" }); // Fallback to .env

export const db = drizzle(process.env.DATABASE_URL!);
