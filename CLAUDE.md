# PropSarathi — CLAUDE.md

## About This Project

PropSarathi is a real estate advisory platform for **Dubai and Bangalore** markets. The website helps buyers discover properties, connect with advisors, and understand the investment case for both cities.

The site is built with **Next.js** and deployed on **Vercel**.

## About the Owner

I am the **non-technical founder**. I give instructions in plain English. Claude should:
- Translate my plain-English requests into code without asking me to clarify technical details
- Explain what it changed and why, in simple terms — no jargon
- Make decisions on implementation details independently; only ask if there is genuine ambiguity about what I want the feature to *do*
- Prefer simple, working solutions over clever or complex ones

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Database | Neon (Postgres, serverless) |
| Auth | next-auth + custom JWT for CRM/portal |
| Forms | react-hook-form + zod |
| Maps | Leaflet (custom KML layers for Dubai & Bangalore) |
| Spreadsheets | Google Sheets API (leads, partners, RM tracking) |
| Deployment | Vercel |
| Analytics | Vercel Analytics |

## Project Structure

```
app/                  # Next.js App Router pages
  page.tsx            # Homepage
  map/                # Interactive property map
  properties/         # Property listings + [slug] detail pages
  blog/               # Blog / articles
  about/              # About page
  contact/            # Contact page
  partner/            # Partner landing page
  partner-portal/     # Authenticated partner portal
  admin-portal/       # Internal admin portal
  crm/                # Internal CRM for the team
  api/                # API route handlers
    forms/            # Lead capture form submissions
    leads/            # Lead management
    map/              # Map layer data
    properties/       # Property data
    crm/              # CRM endpoints
    partner/          # Partner portal endpoints
    admin/            # Admin endpoints (includes verify-login)
    auth/             # Authentication

components/           # Reusable UI components
  Header.tsx
  SharedFooter.tsx    # Single canonical footer (Footer.tsx was deleted)
  Hero.tsx
  Map.tsx / MapClient.tsx / MapEditor.tsx
  FeaturedProperties.tsx
  EnquiryForm.tsx / UnifiedEnquiryForm.tsx
  HomepageClient.tsx
  PartnerPortalPage.tsx
  (+ many more)

lib/                  # Server-side utilities
  db.ts               # Neon/Postgres connection
  googleSheets.ts     # Google Sheets integration
  crmSheets.ts        # CRM-specific sheets logic
  partnerSheets.ts    # Partner sheets logic
  auth.ts / crmAuth.ts / portalAuth.ts  # Auth helpers
  seoMetadata.ts      # SEO helpers
  validation.ts       # Zod schemas
  webhookStorage.ts   # Webhook event storage

scripts/              # One-off seed / migration scripts
public/               # Static assets (images, icons, KML files)
```

## Environment Variables

Secrets live in `.env.local` (not committed). Key variables:

- `DATABASE_URL` / `POSTGRES_URL` — Neon Postgres connection
- `GOOGLE_SHEETS_*` — Google Sheets service account credentials
- `ADMIN_SECRET_KEY` — Admin portal API key (returned to frontend after login; used as `x-admin-key` header)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — Admin portal login credentials (validated server-side only)
- `CRM_ADMIN_PASSWORD` / `CRM_RM_PASSWORD` — CRM user passwords
- `JWT_SECRET` — Secret for signing CRM JWT tokens
- All secrets must also be set in the Vercel dashboard for production

Never commit `.env.local` or any file containing real credentials.

## Key Features

1. **Interactive Map** — Leaflet map showing Dubai and Bangalore properties. City auto-detects from map position. Supports multiple tile styles (Street, Satellite, Terrain, Dark, Light). KML layers for metro lines, zones, and projects.
2. **Property Listings** — Filterable grid with individual property detail pages (`/properties/[slug]`).
3. **Lead Capture** — Enquiry forms on multiple pages. Submissions go to Google Sheets and the database.
4. **CRM** (`/crm`) — Internal tool for the PropSarathi team to manage leads and follow-ups.
5. **Partner Portal** (`/partner-portal`) — Authenticated area for channel partners.
6. **Admin Portal** (`/admin-portal`) — Internal admin dashboard.
7. **Blog** — Markdown-rendered articles.

## Development Commands

```bash
npm run dev      # Start local dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

> Note: `next.config.mjs` has `ignoreBuildErrors: true` — TypeScript errors will not block the build, but try to keep code clean.

## Deployment

- Push to the `main` branch on GitHub → Vercel auto-deploys
- Remote: `https://github.com/pareekshithwork-sketch/propsarathi-website`
- Local working directory: `~/Documents/propsarathi`
- Environment variables must be set in the Vercel dashboard for production; `.env.local` is for local development only

## Coding Guidelines

- Use the **App Router** pattern (no Pages Router)
- UI components go in `components/`, server logic goes in `lib/`
- Use **shadcn/ui** components (already installed) before building custom UI from scratch
- Forms use **react-hook-form** + **zod** for validation
- Keep API routes in `app/api/` following the existing folder structure
- Do not add unnecessary abstractions — keep it simple and working
- Always use `@/` absolute imports (never relative `../../` paths)

## Product Vision

PropSarathi targets ALL customers: buyers, sellers, renters, NRI investors, and channel partners across Pan India and Dubai.

**Three products to build:**
1. **Main Website** — Full property portal: listings, search/filters, map view, compare, EMI calculator, market blog, all contact channels
2. **CRM** — Agent dashboard: auto-capture leads, pipeline stages (New → Contacted → Site Visit → Negotiation → Closed), assign to agents, follow-up reminders, performance reports
3. **Partner Portal** — Channel partner login, submit referrals, track commission, download marketing materials

## Sprint History

### Sprint 1 — April 2026 (Cleanup & Security)

**Cleaned up:**
- Deleted: `App.tsx`, `index.tsx`, `index.html`, `vite.config.ts` (Vite leftover files)
- Deleted: `migrate_temp.js`, `migrate2.js` (one-off migration scripts)
- Deleted: `GOOGLE_SHEETS_SETUP.md`, `GOOGLE_SHEETS_DIRECT_SETUP.md`, `WEBHOOK_SETUP_INSTRUCTIONS.md`, `SETUP_GUIDE.md` (stale setup docs)
- Deleted: `components/Footer.tsx` (duplicate — `SharedFooter.tsx` is the canonical footer used everywhere)
- Deleted: `components/ContactPage.tsx`, `components/BlogPage.tsx` (unused legacy components)

**Security fixes:**
- Admin login: moved credential check from client-side JS to server-side API route (`/api/admin/verify-login`). Credentials no longer visible in browser DevTools
- Admin API key: all admin API routes now read `process.env.ADMIN_SECRET_KEY` instead of the hardcoded string
- CRM credentials: passwords removed from `lib/crmAuth.ts`; now read from `CRM_ADMIN_PASSWORD` / `CRM_RM_PASSWORD` env vars
- CRM JWT secret: removed hardcoded fallback; requires `JWT_SECRET` env var
- Partner portal: fixed broken relative imports (`../../components/Header`) → `@/` absolute imports; `Footer` → `SharedFooter`
- SEO metadata: replaced placeholder phone numbers with real-format placeholders (`+971-50-000-0000`, `+91-98800-00000`)

**Vercel env vars to add (production):**
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` (admin portal login)
- `CRM_ADMIN_PASSWORD`, `CRM_RM_PASSWORD` (CRM logins)
- `JWT_SECRET` (CRM token signing)
