import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Mock activities for development
    const mockActivities = [
      { 
        id: "1", 
        userId: params.userId, 
        type: "daily_login", 
        points: 5, 
        description: "Daily Login", 
        createdAt: new Date(Date.now() - 3600000).toISOString() 
      },
      { 
        id: "2", 
        userId: params.userId, 
        type: "wheel_spin", 
        points: 20, 
        description: "Spinning Wheel", 
        createdAt: new Date(Date.now() - 7200000).toISOString() 
      },
      { 
        id: "3", 
        userId: params.userId, 
        type: "referral", 
        points: 10, 
        description: "Referral Bonus", 
        createdAt: new Date(Date.now() - 86400000).toISOString() 
      },
    ];

    return NextResponse.json(mockActivities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activities' },
      { status: 500 }
    );
  }
}
