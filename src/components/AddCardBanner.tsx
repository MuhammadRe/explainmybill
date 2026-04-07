'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export function AddCardBanner() {
  const [loading, setLoading] = useState(false);

  const handleAddCard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/setup-intent', { method: 'POST' });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.message || 'Failed to open payment setup');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <CreditCard className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900">Add a payment method to unlock scanning</p>
          <p className="text-xs text-amber-700 mt-0.5">
            We require a card on file to prevent abuse. You won't be charged for your free monthly scan.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
        onClick={handleAddCard}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Redirecting...
          </>
        ) : (
          'Add payment method'
        )}
      </Button>
    </div>
  );
}
