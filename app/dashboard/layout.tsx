import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "./_components/navbar";
import AuthWrapper from "./_components/auth-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    console.log('Dashboard layout auth check:', {
      hasResult: !!result,
      hasSession: !!result?.session,
      hasUserId: !!result?.session?.userId,
      userId: result?.session?.userId
    });

    if (!result?.session?.userId) {
      console.log('Dashboard layout: No valid session found, using client-side auth wrapper');
      // Instead of redirecting immediately, use client-side auth wrapper
      // This handles cases where cookies aren't accessible server-side but are available client-side
      return (
        <AuthWrapper>
          <div className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <Navbar />
            
            {/* Main Content Area */}
            <main className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        </AuthWrapper>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        {/* Top Navigation Bar */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Dashboard layout auth error:', error);
    // Use client-side auth wrapper as fallback
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-background">
          {/* Top Navigation Bar */}
          <Navbar />
          
          {/* Main Content Area */}
          <main className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </AuthWrapper>
    );
  }
}
