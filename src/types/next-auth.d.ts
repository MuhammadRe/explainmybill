// ─────────────────────────────────────────────────────
// NextAuth type augmentation
// Extends the default Session and JWT types to include
// our custom fields (id, plan, documentsUsedThisMonth)
// ─────────────────────────────────────────────────────

import 'next-auth';
import type { Plan } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan: Plan;
      documentsUsedThisMonth: number;
    };
  }

  interface User {
    id: string;
    plan: Plan;
    documentsUsedThisMonth: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    plan: Plan;
    documentsUsedThisMonth: number;
  }
}
