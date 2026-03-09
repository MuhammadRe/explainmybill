'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UsageMeterProps {
  used: number;
  limit: number | null; // null = unlimited (Pro)
  plan: string;
}

export function UsageMeter({ used, limit, plan }: UsageMeterProps) {
  const isPro = plan === 'PRO';
  const percentage = limit ? Math.min(100, (used / limit) * 100) : 0;
  const remaining = limit ? Math.max(0, limit - used) : null;
  const isNearLimit = limit ? percentage >= 66 : false;
  const isAtLimit = limit ? used >= limit : false;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium">Monthly Usage</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPro ? (
              <span className="text-blue-600 font-medium">Unlimited analyses</span>
            ) : (
              <>
                <span className={cn('font-semibold', isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : '')}>
                  {used}
                </span>
                {' / '}
                {limit} documents
              </>
            )}
          </p>
        </div>
        {isPro ? (
          <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
            PRO
          </span>
        ) : (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            FREE
          </span>
        )}
      </div>

      {!isPro && limit && (
        <>
          <Progress
            value={percentage}
            className={cn(
              'h-2',
              isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : '[&>div]:bg-blue-500'
            )}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {isAtLimit ? (
                <span className="text-red-600 font-medium">Limit reached — resets next month</span>
              ) : (
                <>{remaining} remaining this month</>
              )}
            </p>
            <Link href="/settings#billing">
              <Button size="sm" variant="gradient" className="h-7 gap-1 text-xs px-3">
                <Zap className="h-3 w-3" />
                Upgrade
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
