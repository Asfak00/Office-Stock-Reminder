# Office Stock Reminder

A production-ready office consumable inventory tracker with automatic email reminders, usage analytics, and a cron-based daily stock checker. Built with Next.js 15, Supabase, and Resend.

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS, shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Email:** Resend
- **Charts:** Recharts
- **Cron:** Vercel Cron Jobs
- **Forms:** React Hook Form + Zod

## Features

- Inventory management (CRUD) with item types: coffee, tissue, custom
- Automatic stock estimation (remaining days based on usage patterns)
- **Off-day-aware calculations** — weekly off days (default: Friday & Saturday) and BD government holidays are skipped in consumption estimates
- **Bangladesh government holidays** baked in for 2025–2026 with Bengali names
- Color-coded stock status: safe / warning / critical
- Daily cron job sends email reminders for low-stock items (24h cooldown, skips off days)
- Usage analytics with charts (daily trend, top items, status distribution)
- Activity history with filters and pagination
- Dark/light theme
- CSV export
- Responsive sidebar with mobile drawer

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd office-stock-reminder
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Enable **Email Auth** in Authentication → Providers
4. Copy your project URL and keys from Settings → API

### 3. Resend Setup

1. Create an account at [resend.com](https://resend.com)
2. Verify your domain or use the onboarding test domain
3. Create an API key from the dashboard

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for cron) |
| `RESEND_API_KEY` | Resend API key |
| `CRON_SECRET` | Random string to secure the cron endpoint |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (e.g. `https://your-app.vercel.app`) |

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Cron Job

The daily stock check runs via `/api/cron` (configured in `vercel.json` for 8:00 AM UTC). It:

1. Iterates all users and their inventory items
2. Calculates remaining days for each item
3. Sends reminder emails for items below threshold (with 24h cooldown)
4. Logs all reminders to `reminder_logs`

### Testing Locally

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron
```

## Deployment (Vercel)

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy — the cron job in `vercel.json` is picked up automatically

## Project Structure

```
├── actions/          # Server actions (auth, inventory, settings, analytics)
├── app/
│   ├── api/cron/     # Daily stock check endpoint
│   ├── auth/         # Login & signup pages
│   ├── dashboard/    # Main app pages (overview, inventory, history, analytics, settings)
│   └── page.tsx      # Landing page
├── components/
│   ├── analytics/    # Analytics client
│   ├── charts/       # Recharts wrappers
│   ├── dashboard/    # Sidebar, navbar, stock cards, activity feed
│   ├── history/      # History list
│   ├── inventory/    # CRUD forms, quick usage buttons
│   ├── settings/     # Settings form, email management
│   ├── shared/       # Reusable primitives
│   └── ui/           # shadcn/ui components
├── lib/              # Supabase clients, validations, utils
├── services/         # Email service (Resend)
├── types/            # TypeScript interfaces
└── utils/            # Stock calculation helpers
```

## License

MIT
