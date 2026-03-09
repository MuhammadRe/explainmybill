import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

// All dashboard routes require authentication.
// This layout fetches the session server-side and redirects if not authenticated.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
