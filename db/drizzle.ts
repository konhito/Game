import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Ensure DATABASE_URL is available
// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL environment variable is not set');
// }

// Create the database connection
const sql = neon("postgresql://neondb_owner:npg_KjtX9RmN5fAn@ep-frosty-sound-a1hv2jpe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
export const db = drizzle(sql, { schema });

// Export the schema for use in other files
export * from './schema';
