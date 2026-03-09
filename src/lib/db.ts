import { PrismaClient } from '@prisma/client';

// ─────────────────────────────────────────────────────
// Prisma Client Singleton
// ─────────────────────────────────────────────────────
// In development, Next.js hot-reloads the module on every file change,
// which would create a new PrismaClient instance each time — exhausting
// the database connection pool. We store the instance on `globalThis`
// to reuse it across hot reloads.

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
