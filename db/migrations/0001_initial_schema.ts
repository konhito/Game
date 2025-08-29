import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, uuid, numeric, pgEnum } from "drizzle-orm/pg-core";

export const activityTypeEnum = pgEnum("activity_type", [
  "daily_login",
  "wheel_spin",
  "ad_watch",
  "referral",
  "challenge",
  "prize_pool",
]);

export const wheelResultEnum = pgEnum("wheel_result", [
  "points",
  "pinecoins",
  "bonus_spins",
  "nothing",
]);

export async function up(db: any) {
  // Create enums first
  await db.execute(sql`CREATE TYPE activity_type AS ENUM ('daily_login', 'wheel_spin', 'ad_watch', 'referral', 'challenge', 'prize_pool')`);
  await db.execute(sql`CREATE TYPE wheel_result AS ENUM ('points', 'pinecoins', 'bonus_spins', 'nothing')`);

  // Create tables
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_stats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      total_points INTEGER NOT NULL DEFAULT 0,
      weekly_points INTEGER NOT NULL DEFAULT 0,
      total_pine_coins NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      daily_login_streak INTEGER NOT NULL DEFAULT 0,
      last_login_date TIMESTAMP,
      spins_remaining INTEGER NOT NULL DEFAULT 3,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_activity (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      type activity_type NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      metadata TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wheel_spin (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      result wheel_result NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      pine_coins NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      bonus_spins INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      weekly_points INTEGER NOT NULL DEFAULT 0,
      total_points INTEGER NOT NULL DEFAULT 0,
      rank INTEGER,
      week_start TIMESTAMP NOT NULL,
      week_end TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS daily_reward (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      claimed BOOLEAN NOT NULL DEFAULT false,
      points INTEGER NOT NULL DEFAULT 5,
      date TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create indexes
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_wheel_spin_user_id ON wheel_spin(user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_daily_reward_user_id ON daily_reward(user_id)`);
}

export async function down(db: any) {
  await db.execute(sql`DROP TABLE IF EXISTS daily_reward`);
  await db.execute(sql`DROP TABLE IF EXISTS leaderboard`);
  await db.execute(sql`DROP TABLE IF EXISTS wheel_spin`);
  await db.execute(sql`DROP TABLE IF EXISTS user_activity`);
  await db.execute(sql`DROP TABLE IF EXISTS user_stats`);
  await db.execute(sql`DROP TYPE IF EXISTS wheel_result`);
  await db.execute(sql`DROP TYPE IF EXISTS activity_type`);
}

