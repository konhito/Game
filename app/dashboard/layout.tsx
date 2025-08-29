import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "./_components/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
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
}
