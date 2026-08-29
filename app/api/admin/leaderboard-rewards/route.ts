import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for Weekly Leaderboard Rewards
 * 
 * This route handles:
 * 1. GET - Fetch current leaderboard reward settings
 * 2. POST - Distribute weekly leaderboard rewards to top 3 users
 * 
 * Backend Implementation Required:
 * - Endpoint: POST /api/admin/leaderboard-rewards/distribute
 * - Should:
 *   1. Get top 3 users from current week's leaderboard
 *   2. Get reward amounts from settings (weekly_leaderboard_rank_1_reward, etc.)
 *   3. Add PineCoins to each user's balance
 *   4. Create records in weekly_leaderboard_reward table
 *   5. Log activity for each user
 */

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Forward request to backend
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me';
    const response = await fetch(`${API_BASE}/api/admin/leaderboard-rewards`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching leaderboard rewards:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leaderboard rewards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Forward request to backend
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me';
    const response = await fetch(`${API_BASE}/api/admin/weekly-settlement`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error distributing leaderboard rewards:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to distribute leaderboard rewards' },
      { status: 500 }
    );
  }
}

