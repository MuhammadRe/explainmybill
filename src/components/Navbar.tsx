'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FileText, Upload, LayoutDashboard, Settings, LogOut, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/upload', label: 'Upload', icon: Upload },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user as any;
  const isPro = user?.plan === 'PRO';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Explain<span className="text-blue-600">MyBill</span>
          </span>
          {isPro && (
            <Badge variant="pro" className="ml-1 text-[10px] px-1.5 py-0">
              PRO
            </Badge>
          )}
        </Link>

        {/* Desktop nav */}
        {session && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Upgrade button for free users */}
              {!isPro && (
                <Link href="/settings#billing" className="hidden md:block">
                  <Button size="sm" variant="gradient" className="gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    Upgrade
                  </Button>
                </Link>
              )}

              {/* Settings link */}
              <Link
                href="/settings"
                className={cn(
                  'hidden md:flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === '/settings'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              {/* Sign out */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex gap-2 text-muted-foreground"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="gradient">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && session && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
                pathname === href || pathname.startsWith(href + '/') ? 'bg-accent' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <Link href="/settings" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground">
            <Settings className="h-4 w-4" /> Settings
          </Link>
          {!isPro && (
            <Link href="/settings#billing" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-blue-600">
              <Zap className="h-4 w-4" /> Upgrade to Pro
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </header>
  );
}
