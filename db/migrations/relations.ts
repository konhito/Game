import { relations } from "drizzle-orm/relations";
import { users, dailyLogins, payoutRequests, pointsHistory, prizePools, prizePoolParticipants, referrals, sessions, weeklyLeaderboard, wheelSpins } from "./schema";

export const dailyLoginsRelations = relations(dailyLogins, ({one}) => ({
	user: one(users, {
		fields: [dailyLogins.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	dailyLogins: many(dailyLogins),
	payoutRequests: many(payoutRequests),
	pointsHistories: many(pointsHistory),
	prizePools: many(prizePools),
	prizePoolParticipants: many(prizePoolParticipants),
	referrals_referrerId: many(referrals, {
		relationName: "referrals_referrerId_users_id"
	}),
	referrals_referredId: many(referrals, {
		relationName: "referrals_referredId_users_id"
	}),
	sessions: many(sessions),
	weeklyLeaderboards: many(weeklyLeaderboard),
	wheelSpins: many(wheelSpins),
}));

export const payoutRequestsRelations = relations(payoutRequests, ({one}) => ({
	user: one(users, {
		fields: [payoutRequests.userId],
		references: [users.id]
	}),
}));

export const pointsHistoryRelations = relations(pointsHistory, ({one}) => ({
	user: one(users, {
		fields: [pointsHistory.userId],
		references: [users.id]
	}),
}));

export const prizePoolsRelations = relations(prizePools, ({one, many}) => ({
	user: one(users, {
		fields: [prizePools.winnerId],
		references: [users.id]
	}),
	prizePoolParticipants: many(prizePoolParticipants),
}));

export const prizePoolParticipantsRelations = relations(prizePoolParticipants, ({one}) => ({
	prizePool: one(prizePools, {
		fields: [prizePoolParticipants.poolId],
		references: [prizePools.id]
	}),
	user: one(users, {
		fields: [prizePoolParticipants.userId],
		references: [users.id]
	}),
}));

export const referralsRelations = relations(referrals, ({one}) => ({
	user_referrerId: one(users, {
		fields: [referrals.referrerId],
		references: [users.id],
		relationName: "referrals_referrerId_users_id"
	}),
	user_referredId: one(users, {
		fields: [referrals.referredId],
		references: [users.id],
		relationName: "referrals_referredId_users_id"
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const weeklyLeaderboardRelations = relations(weeklyLeaderboard, ({one}) => ({
	user: one(users, {
		fields: [weeklyLeaderboard.userId],
		references: [users.id]
	}),
}));

export const wheelSpinsRelations = relations(wheelSpins, ({one}) => ({
	user: one(users, {
		fields: [wheelSpins.userId],
		references: [users.id]
	}),
}));