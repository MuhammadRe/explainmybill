'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function DashboardToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const card = searchParams.get('card');
    const upgraded = searchParams.get('upgraded');
    const credits = searchParams.get('credits');

    if (card === 'added') {
      toast.success('Payment method saved! You can now analyze documents.');
      router.replace('/dashboard');
    } else if (upgraded === 'true') {
      toast.success('Welcome to Pro! Enjoy unlimited analyses.');
      router.replace('/dashboard');
    } else if (credits === 'added') {
      toast.success('Credits added to your account!');
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  return null;
}
