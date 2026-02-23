# CoachForge 🔥

**Hang up the call. Everything else is done.**

AI-powered coaching platform that records, transcribes, and generates session summaries, action items, and follow-up emails — automatically.

An AIONIQS Product · [coachforge.pro](https://coachforge.pro)

---

## Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd coachforge
npm install
```

### 2. Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → Run the migration: `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and keys

### 3. Set Up Stripe
1. Create products in Stripe Dashboard:
   - **Starter** — $49/mo recurring
   - **Pro** — $97/mo recurring
   - **Agency** — $197/mo recurring
2. Copy the Price IDs
3. Set up webhook endpoint: `https://coachforge.pro/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`

### 4. Set Up Services
- **Daily.co** — Sign up at [daily.co](https://daily.co) for video calls
- **Deepgram** — Sign up at [deepgram.com](https://deepgram.com) for transcription
- **Resend** — Sign up at [resend.com](https://resend.com) for transactional email
- **Anthropic** — Get API key at [anthropic.com](https://anthropic.com)

### 5. Environment Variables
```bash
cp .env.local.example .env.local
# Fill in all values
```

### 6. Run
```bash
npm run dev
```

### 7. Deploy
```bash
npx vercel
# Set custom domain: coachforge.pro
```

---

## Architecture

| Layer | Service |
|-------|---------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Video | Daily.co |
| Transcription | Deepgram |
| AI | Claude API (Anthropic) |
| Email | Resend |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     → Landing page (coachforge.pro)
│   ├── (auth)/          → Login, Signup
│   ├── (dashboard)/     → Coach dashboard (all protected)
│   ├── portal/          → Client portal (public, token-auth)
│   └── api/             → All API routes
├── components/          → Reusable UI components
├── lib/
│   ├── supabase/        → Client, server, types
│   ├── stripe/          → Plans, pricing config
│   ├── ai/              → Claude prompts + pipeline
│   ├── email/           → Resend templates
│   └── utils/           → Helpers, constants
└── middleware.ts        → Auth protection
```

---

## Pricing Tiers

| Tier | Price | Sessions | Clients | Key Features |
|------|-------|----------|---------|--------------|
| Free | $0 | 2/mo | 1 | Summaries, action items |
| Starter | $49/mo | 15/mo | 15 | + Follow-up emails, prep briefs |
| Pro | $97/mo | 40/mo | ∞ | + Portal, dashboard, reports, nudges |
| Agency | $197/mo | ∞ | ∞ | + Multi-coach, white-label, analytics |

---

## Key Files

- `src/lib/ai/process-session.ts` — Core AI pipeline
- `src/lib/ai/prompts.ts` — All Claude prompt templates
- `src/app/api/sessions/[id]/end/route.ts` — Session end + AI processing
- `supabase/migrations/001_initial_schema.sql` — Full database schema

---

© 2026 AIONIQS · CoachForge
