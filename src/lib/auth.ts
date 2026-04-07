import { NextAuthOptions, getServerSession } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

// ─────────────────────────────────────────────────────
// NextAuth Configuration
// ─────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  // Use Prisma to store sessions, accounts, and users in PostgreSQL
  adapter: PrismaAdapter(prisma),

  // Use JWT strategy so sessions are stateless (no session table lookups)
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2 hours
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    // ── Email & Password ──────────────────────────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          plan: user.plan,
          documentsUsedThisMonth: user.documentsUsedThisMonth,
        };
      },
    }),

    // ── Google OAuth ──────────────────────────────────
    // Only active if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    // Called when JWT is created or updated
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, user object is available
      if (user) {
        token.id = user.id;
        token.plan = (user as any).plan ?? 'FREE';
        token.documentsUsedThisMonth = (user as any).documentsUsedThisMonth ?? 0;
      }

      // When session.update() is called from the client, refresh from DB
      if (trigger === 'update' && session?.plan) {
        token.plan = session.plan;
        token.documentsUsedThisMonth = session.documentsUsedThisMonth;
      }

      // Always fetch fresh user data from DB to get up-to-date plan/usage
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true, documentsUsedThisMonth: true },
        });
        if (dbUser) {
          token.plan = dbUser.plan;
          token.documentsUsedThisMonth = dbUser.documentsUsedThisMonth;
        }
      }

      return token;
    },

    // Called whenever the session is checked
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).plan = token.plan;
        (session.user as any).documentsUsedThisMonth = token.documentsUsedThisMonth;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// ─── Server-side session helper ───────────────────────
// Use this in Server Components and API routes
export const getAuthSession = () => getServerSession(authOptions);
