'use client';

// ─────────────────────────────────────────────────────
// Settings Page — Profile + Billing management
// ─────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Loader2, User, CreditCard, Zap, CheckCircle2, Coins, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';

interface UserData {
  name: string;
  email: string;
  plan: string;
  credits: number;
  stripeCurrentPeriodEnd: string | null;
  usage: {
    used: number;
    limit: number | null;
    plan: string;
    resetAt: string;
  };
}

export default function SettingsPage() {
  const { update } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  // Delete account
  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status})`);
      }
      await signOut({ callbackUrl: '/' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account. Please try again.');
      setDeletingAccount(false);
    }
  };

  // Buy credit pack
  const handleBuyCredits = async (packId: string) => {
    setLoadingCredits(packId);
    try {
      const res = await fetch('/api/stripe/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout');
      setLoadingCredits(null);
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
              ? `Pro plan: ${userData.usage.used} / 300 analyses used this month.`
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

              {/* Credits balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Pay-as-you-go credits</span>
                </div>
                <span className="text-sm font-semibold">
                  {userData.credits} {userData.credits === 1 ? 'credit' : 'credits'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Credits never expire. Each credit = 1 document analysis.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'credits_5', label: '5 credits', price: '€3.99' },
                  { id: 'credits_10', label: '10 credits', price: '€6.99' },
                ].map((pack) => (
                  <Button
                    key={pack.id}
                    variant="outline"
                    className="flex flex-col h-auto py-3 gap-0.5"
                    onClick={() => handleBuyCredits(pack.id)}
                    disabled={loadingCredits === pack.id}
                  >
                    {loadingCredits === pack.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span className="font-semibold">{pack.label}</span>
                        <span className="text-xs text-muted-foreground">{pack.price}</span>
                      </>
                    )}
                  </Button>
                ))}
              </div>

              <Separator />

              {/* Pro plan features */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Upgrade to Pro — €9/month</p>
                {[
                  '300 document analyses per month',
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
            Permanently delete your account and all your data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete account
          </Button>
        </CardContent>
      </Card>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <TriangleAlert className="h-5 w-5" />
              Delete your account?
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-1">
              <span className="block">This will permanently delete:</span>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Your account and profile</li>
                <li>All uploaded documents and analyses</li>
                <li>Your active subscription (if any)</li>
              </ul>
              {isPro && (
                <span className="block pt-2 rounded-md bg-orange-50 border border-orange-200 px-3 py-2 text-sm text-orange-700 font-medium">
                  Your active Pro subscription will be cancelled immediately. You will not be charged again.
                </span>
              )}
              <span className="block pt-2 font-medium text-foreground">
                Type <span className="font-mono text-red-600">DELETE</span> to confirm.
              </span>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="font-mono"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setDeleteConfirmText('')}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
              onClick={handleDeleteAccount}
            >
              {deletingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete my account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
