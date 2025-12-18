# Backend Implementation Guide: Weekly Leaderboard Rewards

This document outlines what needs to be implemented on the backend to support the weekly leaderboard reward system.

## Overview

The system automatically distributes PineCoins to the top 3 users on the weekly leaderboard when it resets. The reward amounts are configurable by admins through the settings page.

## Database Schema

### New Table: `weekly_leaderboard_reward`

```sql
CREATE TABLE weekly_leaderboard_reward (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  pine_coins NUMERIC(10, 2) NOT NULL,
  week_start TIMESTAMP NOT NULL,
  week_end TIMESTAMP NOT NULL,
  distributed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weekly_leaderboard_reward_user_id ON weekly_leaderboard_reward(user_id);
CREATE INDEX idx_weekly_leaderboard_reward_week ON weekly_leaderboard_reward(week_start, week_end);
```

### Settings Keys

The following settings should be stored in your settings table:

- `weekly_leaderboard_rank_1_reward` (number): PineCoins for 1st place (default: 100.00)
- `weekly_leaderboard_rank_2_reward` (number): PineCoins for 2nd place (default: 50.00)
- `weekly_leaderboard_rank_3_reward` (number): PineCoins for 3rd place (default: 25.00)

## API Endpoints

### 1. GET /api/admin/leaderboard-rewards

Get current leaderboard reward settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "rank_1_reward": "100.00",
    "rank_2_reward": "50.00",
    "rank_3_reward": "25.00"
  }
}
```

### 2. POST /api/admin/leaderboard-rewards/distribute

Manually trigger distribution of weekly leaderboard rewards.

**Request Body:**
```json
{
  "week_start": "2024-01-01T00:00:00Z",
  "week_end": "2024-01-07T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distributed": [
      {
        "user_id": "user123",
        "rank": 1,
        "pine_coins": "100.00",
        "name": "User Name"
      },
      {
        "user_id": "user456",
        "rank": 2,
        "pine_coins": "50.00",
        "name": "User Name 2"
      },
      {
        "user_id": "user789",
        "rank": 3,
        "pine_coins": "25.00",
        "name": "User Name 3"
      }
    ],
    "total_distributed": "175.00"
  }
}
```

## Weekly Reset Logic

The weekly leaderboard reset should automatically:

1. **Get Top 3 Users** from the current week's leaderboard (sorted by `weekly_points` DESC)
2. **Get Reward Settings** from the settings table
3. **Distribute Rewards**:
   - Add PineCoins to each user's `total_pine_coins` in `user_stats` table
   - Create a record in `weekly_leaderboard_reward` table
   - Log an activity for each user (type: `prize_pool` or `leaderboard_reward`)
4. **Reset Weekly Points** for all users (set `weekly_points` to 0)
5. **Update Leaderboard** entries for the new week

### Implementation Example (Pseudocode)

```javascript
async function distributeWeeklyLeaderboardRewards(weekStart, weekEnd) {
  // 1. Get top 3 users from leaderboard
  const topUsers = await db.query(`
    SELECT 
      l.user_id,
      l.weekly_points,
      u.name,
      us.total_pine_coins
    FROM leaderboard l
    JOIN "user" u ON u.id = l.user_id
    JOIN user_stats us ON us.user_id = l.user_id
    WHERE l.week_start = $1 AND l.week_end = $2
    ORDER BY l.weekly_points DESC
    LIMIT 3
  `, [weekStart, weekEnd]);

  // 2. Get reward settings
  const rank1Reward = await getSetting('weekly_leaderboard_rank_1_reward', '100.00');
  const rank2Reward = await getSetting('weekly_leaderboard_rank_2_reward', '50.00');
  const rank3Reward = await getSetting('weekly_leaderboard_rank_3_reward', '25.00');

  const rewards = [rank1Reward, rank2Reward, rank3Reward];
  const distributed = [];

  // 3. Distribute rewards
  for (let i = 0; i < topUsers.length && i < 3; i++) {
    const user = topUsers[i];
    const rewardAmount = parseFloat(rewards[i]);
    const rank = i + 1;

    // Update user stats
    await db.query(`
      UPDATE user_stats
      SET total_pine_coins = total_pine_coins + $1,
          updated_at = NOW()
      WHERE user_id = $2
    `, [rewardAmount, user.user_id]);

    // Create reward record
    await db.query(`
      INSERT INTO weekly_leaderboard_reward 
      (user_id, rank, pine_coins, week_start, week_end, distributed_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [user.user_id, rank, rewardAmount, weekStart, weekEnd]);

    // Log activity
    await db.query(`
      INSERT INTO user_activity 
      (user_id, type, points, description, metadata)
      VALUES ($1, 'prize_pool', 0, $2, $3)
    `, [
      user.user_id,
      `Weekly Leaderboard Reward - Rank ${rank} - ${rewardAmount} PineCoins`,
      JSON.stringify({ rank, pine_coins: rewardAmount, week_start: weekStart, week_end: weekEnd })
    ]);

    distributed.push({
      user_id: user.user_id,
      rank: rank,
      pine_coins: rewardAmount.toString(),
      name: user.name
    });
  }

  return {
    distributed,
    total_distributed: distributed.reduce((sum, d) => sum + parseFloat(d.pine_coins), 0).toFixed(2)
  };
}
```

## Integration with Weekly Reset

The weekly reset cron job or scheduled task should:

1. Calculate the previous week's date range
2. Call `distributeWeeklyLeaderboardRewards(weekStart, weekEnd)`
3. Reset all users' weekly points
4. Create new leaderboard entries for the new week

## Error Handling

- If a user doesn't have enough users in the leaderboard (less than 3), distribute rewards to available users
- If settings are missing, use default values (100, 50, 25)
- Log all distribution events for audit purposes
- Handle database transaction failures gracefully

## Testing

Test cases to implement:

1. ✅ Distribute rewards when exactly 3 users exist
2. ✅ Distribute rewards when less than 3 users exist
3. ✅ Handle missing reward settings (use defaults)
4. ✅ Verify PineCoins are correctly added to user balances
5. ✅ Verify reward records are created
6. ✅ Verify activities are logged
7. ✅ Handle concurrent distribution attempts
8. ✅ Verify transaction rollback on errors

