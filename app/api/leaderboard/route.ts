import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';

    // Forward the auth token from the incoming request
    const authHeader = request.headers.get('authorization');

    const response = await fetch(
      `${API_BASE}/api/users/leaderboard?limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status} ${text}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (!result.success || !result.data?.users) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from backend' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        users: result.data.users,
        weekly_pool: result.data.weekly_pool,
        weekly_rewards: result.data.weekly_rewards,
        task_point_rules: result.data.task_point_rules,
      },
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
