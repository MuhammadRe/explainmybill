'use client';

import Link from 'next/link';
import { Zap, Coins } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn, PRO_PLAN_LIMIT } from '@/lib/utils';

interface UsageMeterProps {
  used: number;
  limit: number | null; // null = unlimited (Pro)
  plan: string;
  credits?: number;
}

export function UsageMeter({ used, limit, plan, credits = 0 }: UsageMeterProps) {
  const isPro = plan === 'PRO';
  const effectiveLimit = isPro ? PRO_PLAN_LIMIT : limit;
  const displayedUsed = effectiveLimit ? Math.min(used, effectiveLimit) : used;
  const rawPercentage = effectiveLimit ? Math.min(100, (displayedUsed / effectiveLimit) * 100) : 0;
  // Cap at 95% visually when credits are available so bar doesn't look fully blocked
  const percentage = rawPercentage >= 100 && credits > 0 ? 95 : rawPercentage;
  const remaining = effectiveLimit ? Math.max(0, effectiveLimit - used) : null;
  const isNearLimit = effectiveLimit ? rawPercentage >= 66 : false;
  const isAtLimit = effectiveLimit ? used >= effectiveLimit : false;
  const isTrulyBlocked = isAtLimit && credits === 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium">Monthly Usage</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className={cn('font-semibold', isTrulyBlocked ? 'text-red-600' : isNearLimit ? 'text-orange-600' : '')}>
              {displayedUsed}
            </span>
            {' / '}
            {isPro ? PRO_PLAN_LIMIT : limit} {isPro ? '' : 'free '}{(isPro ? PRO_PLAN_LIMIT : limit) === 1 ? 'analysis' : 'analyses'} this month
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

      <Progress
        value={percentage}
        className={cn(
          'h-2 mt-3',
          isTrulyBlocked ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : '[&>div]:bg-blue-500'
        )}
      />

      {!isPro && (
        <>
          {/* Credits balance */}
          {credits > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <Coins className="h-3.5 w-3.5" />
              {credits} pay-as-you-go {credits === 1 ? 'credit' : 'credits'} available
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {isAtLimit && credits === 0 ? (
                <span className="text-red-600 font-medium">Free analysis used — buy credits or upgrade</span>
              ) : isAtLimit ? (
                <span className="text-emerald-600 font-medium">Using credits for next analyses</span>
              ) : (
                <>{remaining} free {remaining === 1 ? 'analysis' : 'analyses'} remaining</>
              )}
            </p>
            <div className="flex gap-2">
              {isAtLimit && (
                <Link href="/settings#billing">
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-xs px-3">
                    <Coins className="h-3 w-3" />
                    Buy credits
                  </Button>
                </Link>
              )}
              <Link href="/settings#billing">
                <Button size="sm" variant="gradient" className="h-7 gap-1 text-xs px-3">
                  <Zap className="h-3 w-3" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {isPro && isAtLimit && (
        <p className="mt-3 text-xs text-red-600 font-medium">
          Monthly limit reached. Resets next month.
        </p>
      )}

      {isPro && !isAtLimit && (
        <p className="mt-2 text-xs text-muted-foreground">
          {remaining} {remaining === 1 ? 'analysis' : 'analyses'} remaining this month
        </p>
      )}
    </div>
  );
}
