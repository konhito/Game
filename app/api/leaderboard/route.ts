import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock leaderboard for development
    const mockLeaderboard = [
      { userId: "user1", weeklyPoints: 3200, totalPoints: 8500, rank: 1, name: "Player1", image: null },
      { userId: "user2", weeklyPoints: 2850, totalPoints: 7200, rank: 2, name: "Player2", image: null },
      { userId: "user3", weeklyPoints: 2600, totalPoints: 6800, rank: 3, name: "Player3", image: null },
      { userId: "user4", weeklyPoints: 2400, totalPoints: 6200, rank: 4, name: "Player4", image: null },
      { userId: "user5", weeklyPoints: 450, totalPoints: 1250, rank: 5, name: "Player5", image: null },
    ];

    return NextResponse.json(mockLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
