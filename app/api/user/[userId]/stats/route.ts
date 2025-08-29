import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Mock user stats for development
    const mockStats = {
      id: "stats1",
      userId: params.userId,
      totalPoints: 1250,
      weeklyPoints: 450,
      totalPineCoins: "125.50",
      dailyLoginStreak: 3,
      spinsRemaining: 3,
      lastLoginDate: new Date().toISOString()
    };

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
