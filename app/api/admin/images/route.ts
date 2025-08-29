import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with actual database queries
const mockImages = [
  {
    id: "1",
    userId: 1,
    userName: "John Doe",
    imageUrl: "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Beautiful+Sunset",
    title: "Beautiful Sunset",
    description: "A stunning sunset over the mountains captured during my hiking trip",
    submittedAt: "2025-01-15T14:30:00Z",
    status: "pending",
    category: "Nature"
  },
  {
    id: "2",
    userId: 2,
    userName: "Jane Smith",
    imageUrl: "https://via.placeholder.com/300x200/059669/FFFFFF?text=City+Skyline",
    title: "City Skyline",
    description: "Modern city skyline at golden hour with amazing reflections",
    submittedAt: "2025-01-15T12:15:00Z",
    status: "approved",
    category: "Urban"
  },
  {
    id: "3",
    userId: 3,
    userName: "Mike Johnson",
    imageUrl: "https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Wildlife+Photo",
    title: "Wildlife Photo",
    description: "Rare bird species captured in its natural habitat",
    submittedAt: "2025-01-15T10:45:00Z",
    status: "pending",
    category: "Wildlife"
  },
  {
    id: "4",
    userId: 4,
    userName: "Sarah Wilson",
    imageUrl: "https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=Abstract+Art",
    title: "Abstract Art",
    description: "Creative abstract composition using light and shadows",
    submittedAt: "2025-01-14T16:20:00Z",
    status: "rejected",
    category: "Art"
  },
  {
    id: "5",
    userId: 1,
    userName: "John Doe",
    imageUrl: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Food+Photography",
    title: "Food Photography",
    description: "Delicious homemade pasta with fresh herbs and parmesan",
    submittedAt: "2025-01-14T13:10:00Z",
    status: "pending",
    category: "Food"
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
    // 3. Query the database for all image submissions
    // 4. Return the image data

    return NextResponse.json(mockImages);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

