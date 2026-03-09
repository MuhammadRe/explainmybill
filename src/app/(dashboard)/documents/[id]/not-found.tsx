import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">Document not found</h2>
      <p className="text-muted-foreground text-sm max-w-sm">
        This document may have been deleted or you may not have permission to view it.
      </p>
      <Link href="/dashboard">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
