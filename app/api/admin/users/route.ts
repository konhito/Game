import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with actual database queries
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    totalPoints: 150,
    totalPineCoins: "15.00",
    status: "active",
    created_at: "2025-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    totalPoints: 320,
    totalPineCoins: "32.00",
    status: "active",
    created_at: "2025-01-14T15:45:00Z"
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "user",
    totalPoints: 85,
    totalPineCoins: "8.50",
    status: "active",
    created_at: "2025-01-13T09:20:00Z"
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "user",
    totalPoints: 450,
    totalPineCoins: "45.00",
    status: "suspended",
    created_at: "2025-01-12T14:15:00Z"
  }
];

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (you should implement proper JWT verification here)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock data
    // In production, you would:
    // 1. Verify the JWT token
    // 2. Check if the user has admin role
    // 3. Query the database for all users
    // 4. Return the user data

    return NextResponse.json(mockUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

