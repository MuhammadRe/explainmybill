# ExplainMyBill

> AI-powered bill and contract explainer — built with Next.js 14 + Claude AI

ExplainMyBill helps users understand bills, contracts, and financial documents in plain English. Upload a PDF, image, or paste text and get instant AI analysis including hidden fees, risks, savings tips, and important dates.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router + TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v4 (email/password + Google OAuth) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Payments | Stripe (subscriptions + webhooks) |
| Styling | Tailwind CSS + custom shadcn-style components |
| State | TanStack Query v5 |
| File Parsing | pdf-parse + Claude Vision (images) |

---

## Prerequisites

- **Node.js** 18.17+ — [nodejs.org](https://nodejs.org)
- **PostgreSQL** 14+ — [postgresql.org](https://www.postgresql.org/) or use [Docker](https://www.docker.com/)
- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)
- **Stripe account** (optional for payments) — [stripe.com](https://stripe.com)

---

## Quick Start

### 1. Install dependencies

```bash
cd explainmybill
npm install
```

### 2. Set up environment variables

```bash
# Copy the example file
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
# Required
DATABASE_URL="postgresql://postgres:password@localhost:5432/explainmybill"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."

# Optional (for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Start PostgreSQL

**Option A — Using Docker (recommended for local dev):**
```bash
docker run --name explainmybill-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=explainmybill \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**Option B — Local PostgreSQL:**
```bash
psql -U postgres -c "CREATE DATABASE explainmybill;"
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push

# (Optional) Seed with demo data
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema changes to database
npm run db:migrate   # Create a new migration file
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Seed demo data
```

---
## Project Structure

```
explainmybill/
├── prisma/
│   ├── schema.prisma          # DB models: User, Document, Analysis
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, Register pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Protected: Dashboard, Upload, Documents
│   │   │   ├── dashboard/
│   │   │   ├── upload/
│   │   │   ├── documents/
│   │   │   └── settings/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth + Register
│   │   │   ├── documents/     # CRUD + status polling
│   │   │   ├── upload/        # File upload + AI trigger
│   │   │   ├── stripe/        # Checkout + Webhook + Portal
│   │   │   └── user/          # Profile management
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # Public landing page
│   ├── components/
│   │   ├── ui/                # Button, Card, Badge, Input, etc.
│   │   ├── AnalysisResult.tsx # Full analysis display
│   │   ├── DocumentCard.tsx   # Dashboard card
│   │   ├── DocumentUploader.tsx  # Drag & drop + paste
│   │   ├── Navbar.tsx
│   │   ├── Providers.tsx      # SessionProvider + QueryClient
│   │   └── UsageMeter.tsx
│   ├── lib/
│   │   ├── ai/analyzer.ts     # Claude AI integration
│   │   ├── parsers/document.ts # PDF + image extraction
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma singleton
│   │   ├── stripe.ts          # Stripe helpers
│   │   └── utils.ts           # Shared utilities
│   ├── types/
│   │   ├── index.ts           # App types
│   │   └── next-auth.d.ts     # Session type augmentation
│   └── middleware.ts          # Route protection
├── uploads/                   # Local file storage (gitignored)
├── .env.example
├── .env.local                 # Your actual keys (never commit)
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## How Document Analysis Works

```
User uploads file
       │
       ▼
POST /api/upload
  1. Auth check + usage limit check
  2. Validate file type + size
  3. Save file to disk (uploads/userId/)
  4. Create Document record (status: PROCESSING)
  5. Return documentId immediately (202 Accepted)
       │
       ▼ (background)
  6. Extract content:
     - PDF → pdf-parse → text string
     - Image → base64 → Claude Vision
     - Text → direct use
  7. Call Claude API with structured prompt
  8. Parse JSON response
  9. Save Analysis to DB
 10. Update Document status → COMPLETED
 11. Increment user's monthly usage counter
       │
       ▼
Frontend polls /api/documents/:id/status every 3s
  → Redirect to full analysis when COMPLETED
```

---
## Future Features & Improvements

### Near-term
- [ ] Email notifications when analysis is complete
- [ ] Export analysis as PDF report
- [ ] Document comparison (compare two bills)
- [ ] Browser extension to capture bills from websites
- [ ] Multi-language support (Spanish, French, German)

### Medium-term
- [ ] Recurring bill tracking (upload same bill monthly)
- [ ] Spending trends and analytics dashboard
- [ ] Provider database for comparison hints
- [ ] Team/family accounts with shared history
- [ ] API access for developers

### Technical improvements
- [ ] Background job queue (Bull/BullMQ) for heavy processing
- [ ] Redis caching for frequently accessed analyses
- [ ] WebSocket for real-time status updates (replace polling)
- [ ] Rate limiting with Redis
- [ ] Audit log for security compliance
- [ ] Two-factor authentication (2FA)

---

## Security Notes

- Uploaded files are stored in `uploads/` (gitignored, not accessible via HTTP)
- Documents are associated with user IDs — users can only access their own files
- API routes verify ownership before returning document data
- Passwords are hashed with bcrypt (12 rounds)
- NextAuth JWT tokens are signed with `NEXTAUTH_SECRET`
- Stripe webhook signatures are verified before processing

---

## License

MIT — use freely for personal and commercial projects.
