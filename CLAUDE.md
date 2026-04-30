# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Next.js 16, http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

**SV Cars** — rent-a-car website for a company in Mostar, Bosnia and Herzegovina. Next.js 16 + React 19 + Supabase + Tailwind CSS 4. Deployed to Vercel (fra1 region).

### Routing & i18n

- `next-intl` with two locales: **hr** (default), **en**. Locale prefix is `as-needed` (hr omitted from URLs).
- Public pages live under `src/app/[locale]/` — home, vozila (vehicles), o-nama, usluge, kontakt, uslovi.
- Vehicle detail page: `src/app/[locale]/vozila/[slug]/page.tsx`.
- Admin panel at `src/app/admin/` — separate layout, no i18n, no Navbar/Footer. Uses Supabase Auth (email/password). Dashboard pages use a route group `(dashboard)` with sidebar.
- Translation files: `src/i18n/messages/{hr,en}.json`.

### Data Layer

- **Supabase** as database and auth. Two client factories:
  - `src/lib/supabase.ts` — browser client (client components)
  - `src/lib/supabase-server.ts` — server client (RSC/Server Actions, uses cookies)
- `src/lib/queries.ts` — read queries (getVehicles, getVehicleBySlug, etc.)
- `src/lib/actions.ts` — server actions (createReservation, sendContactMessage)
- DB schema in `supabase/migrations/` — tables: vehicles, reservations, contact_messages, chat_sessions, processed_messages, webhook_logs
- Types mirror DB schema in `src/types/index.ts`

### AI Chatbot

- Shared AI engine in `src/lib/ai/process-message.ts` — uses **Gemini 2.5 Flash** with function calling (get_vehicles, check_availability, create_reservation).
- Serves both the website chatbot (`src/components/ChatBot.tsx` → `src/app/api/chat/route.ts`) and Instagram DM webhook (`src/app/api/instagram/webhook/route.ts`).
- Chat sessions persisted in Supabase (`src/lib/sessions.ts`), capped at 30 messages via `append_messages_atomic` RPC.

### Styling

- Tailwind CSS 4 with custom CSS variables defined in `src/globals.css`. Dark theme with accent color `#E85A2B`.
- Use semantic color tokens: `bg-bg-primary`, `bg-bg-card`, `text-text-secondary`, `bg-accent`, `border-border`, etc.
- Fonts: Montserrat (headings via `font-[family-name:var(--font-montserrat)]`), Inter (body, default).
- Framer Motion for animations (`src/components/motion/`).

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, used by AI engine and session management
- `GEMINI_API_KEY` — for chatbot AI
- Instagram webhook env vars for DM integration

### Admin API (`/api/admin`)

- Single POST endpoint for all DB operations. Auth via `x-admin-secret` header or `?secret=` query param (value: `ADMIN_TOOLS_SECRET` env var).
- Actions: `list`, `get`, `insert`, `update`, `upsert`, `delete`, `bulk_update`, `bulk_delete`, `count`, `list_storage`, `delete_storage`.
- Use from Claude Code terminal: `curl -X POST http://localhost:3000/api/admin -H "Content-Type: application/json" -H "x-admin-secret: $ADMIN_TOOLS_SECRET" -d '{"action":"list","table":"vehicles"}'`

### Key Conventions

- Prices are in **KM** (convertible mark). `price_daily` is integer, `price_weekly` is nullable.
- Vehicle categories: economy, compact, suv, premium, van, quad.
- UI copy is primarily in Croatian/Bosnian. User-facing error messages follow this pattern.
- Vehicle images stored in Supabase Storage, served via `remotePatterns` in next.config.ts.
