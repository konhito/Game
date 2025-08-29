import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin (you should implement proper JWT verification here)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // For now, return success response
    // In production, you would:
    // 1. Verify the JWT token
    // 2. Check if the user has admin role
    // 3. Update the image status in the database
    // 4. If approved, add 20 points to the user's account
    // 5. Send notification to the user

    if (status === 'approved') {
      // Add 20 points to user account
      console.log(`Image ${id} approved. Adding 20 points to user account.`);
      
      // Here you would:
      // 1. Update image status to 'approved'
      // 2. Add 20 points to user's totalPoints
      // 3. Add 2.00 PineCoins to user's totalPineCoins
      // 4. Create an activity record
      // 5. Send notification to user
    } else {
      console.log(`Image ${id} rejected.`);
      
      // Here you would:
      // 1. Update image status to 'rejected'
      // 2. Optionally send rejection reason to user
      // 3. Create an activity record
    }

    return NextResponse.json({ 
      success: true, 
      message: `Image ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      pointsAwarded: status === 'approved' ? 20 : 0
    });

  } catch (error) {
    console.error('Error updating image status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

