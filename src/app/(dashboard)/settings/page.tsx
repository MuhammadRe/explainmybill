'use client';

// ─────────────────────────────────────────────────────
// Settings Page — Profile + Billing management
// ─────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Loader2, User, CreditCard, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UserData {
  name: string;
  email: string;
  plan: string;
  stripeCurrentPeriodEnd: string | null;
  usage: {
    used: number;
    limit: number | null;
    plan: string;
    resetAt: string;
  };
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Fetch user data
  useEffect(() => {
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => {
        setUserData(data);
        setName(data.name || '');
      });
  }, []);

  // Save profile
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to save');
      await update({ name }); // Update NextAuth session
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Upgrade to Pro (Stripe Checkout)
  const handleUpgrade = async () => {
    setLoadingCheckout(true);
    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST' });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url; // Redirect to Stripe
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout');
      setLoadingCheckout(false);
    }
  };

  // Manage subscription (Stripe Portal)
  const handleManageBilling = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST' });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to open billing portal');
      setLoadingPortal(false);
    }
  };

  const isPro = userData?.plan === 'PRO';

  if (!userData) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and subscription</p>
      </div>

      {/* ── Profile section ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={userData.email} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <Button
            onClick={saveProfile}
            disabled={savingProfile || name === userData.name}
            className="w-full sm:w-auto"
          >
            {savingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ── Billing section ── */}
      <Card id="billing">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Subscription</CardTitle>
            </div>
            <Badge variant={isPro ? 'pro' : 'secondary'}>
              {isPro ? 'Pro' : 'Free'}
            </Badge>
          </div>
          <CardDescription>
            {isPro
              ? 'You have unlimited document analyses.'
              : `Free plan: ${userData.usage.used} / ${userData.usage.limit} analyses used this month.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro ? (
            <>
              {userData.stripeCurrentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  Current period ends:{' '}
                  <span className="font-medium text-foreground">
                    {new Date(userData.stripeCurrentPeriodEnd).toLocaleDateString()}
                  </span>
                </p>
              )}
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={loadingPortal}
              >
                {loadingPortal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Manage billing & cancel'
                )}
              </Button>
            </>
          ) : (
            <>
              <Separator />
              {/* Pro plan features */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Upgrade to Pro — €9/month</p>
                {[
                  'Unlimited document analyses',
                  'All document types supported',
                  'Priority AI processing',
                  'Full history access',
                  'Cancel anytime',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              <Button
                variant="gradient"
                className="w-full gap-2"
                onClick={handleUpgrade}
                disabled={loadingCheckout}
              >
                {loadingCheckout ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Secure payment via Stripe. Cancel anytime.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Danger zone ── */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            onClick={() => toast.error('Account deletion — contact support@explainmybill.com')}
          >
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
