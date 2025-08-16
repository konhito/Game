import { pgTable, text, timestamp, unique, uuid, boolean, integer, numeric, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	image: text(),
	emailVerified: timestamp("email_verified", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	username: text(),
	phone: text(),
	dateOfBirth: timestamp("date_of_birth", { mode: 'string' }),
	gender: text(),
	referralCode: text("referral_code"),
	referredBy: text("referred_by"),
	isInfluencer: boolean("is_influencer").default(false),
	totalPoints: integer("total_points").default(0),
	weeklyPoints: integer("weekly_points").default(0),
	pineCoins: numeric("pine_coins", { precision: 10, scale:  2 }).default('0'),
	password: text(),
	provider: text(),
	providerId: text("provider_id"),
	isActive: boolean("is_active").default(true),
	isBanned: boolean("is_banned").default(false),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
	unique("users_referral_code_unique").on(table.referralCode),
]);

export const dailyLogins = pgTable("daily_logins", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	loginDate: timestamp("login_date", { mode: 'string' }).notNull(),
	streak: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "daily_logins_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const payoutRequests = pgTable("payoutRequests", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	status: text().default('pending'),
	paymentMethod: text("payment_method").notNull(),
	paymentDetails: text("payment_details"),
	adminNotes: text("admin_notes"),
	requestedAt: timestamp("requested_at", { mode: 'string' }).defaultNow().notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payoutRequests_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const pointsHistory = pgTable("points_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	points: integer().notNull(),
	action: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "points_history_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const prizePools = pgTable("prize_pools", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	entryFee: numeric("entry_fee", { precision: 10, scale:  2 }).notNull(),
	maxParticipants: integer("max_participants"),
	currentParticipants: integer("current_participants").default(0),
	totalPool: numeric("total_pool", { precision: 10, scale:  2 }).default('0'),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	status: text().default('active'),
	winnerId: uuid("winner_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.winnerId],
			foreignColumns: [users.id],
			name: "prize_pools_winner_id_users_id_fk"
		}),
]);

export const prizePoolParticipants = pgTable("prize_pool_participants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	poolId: uuid("pool_id").notNull(),
	userId: uuid("user_id").notNull(),
	entryDate: timestamp("entry_date", { mode: 'string' }).defaultNow().notNull(),
	isWinner: boolean("is_winner").default(false),
}, (table) => [
	foreignKey({
			columns: [table.poolId],
			foreignColumns: [prizePools.id],
			name: "prize_pool_participants_pool_id_prize_pools_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "prize_pool_participants_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const referrals = pgTable("referrals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	referrerId: uuid("referrer_id").notNull(),
	referredId: uuid("referred_id").notNull(),
	status: text().default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.referrerId],
			foreignColumns: [users.id],
			name: "referrals_referrer_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.referredId],
			foreignColumns: [users.id],
			name: "referrals_referred_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
	sessionToken: text("session_token").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("sessions_session_token_unique").on(table.sessionToken),
]);

export const weeklyLeaderboard = pgTable("weekly_leaderboard", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	weekStart: timestamp("week_start", { mode: 'string' }).notNull(),
	weekEnd: timestamp("week_end", { mode: 'string' }).notNull(),
	userId: uuid("user_id").notNull(),
	rank: integer().notNull(),
	points: integer().notNull(),
	reward: numeric({ precision: 10, scale:  2 }),
	isPaid: boolean("is_paid").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "weekly_leaderboard_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const wheelSpins = pgTable("wheel_spins", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	reward: text().notNull(),
	pointsEarned: integer("points_earned").notNull(),
	isFree: boolean("is_free").default(true),
	cost: numeric({ precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "wheel_spins_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
