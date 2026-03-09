import Link from 'next/link';
import { FileText } from 'lucide-react';

// Auth pages use a centered, minimal layout
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Minimal header with just the logo */}
      <header className="border-b py-4">
        <div className="container">
          <Link href="/" className="flex w-fit items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">
              Explain<span className="text-blue-600">MyBill</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Centered auth card */}
      <main className="flex flex-1 items-center justify-center p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
