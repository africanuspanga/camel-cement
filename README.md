# Camel Cement Digital Platform

Corporate website, customer tools, Camel Build Assistant (AI) and administration
dashboard for **Camel Cement (T) Limited**, a member of Amsons Group.

**We Build Stronger.**

## Stack

- **Frontend:** Next.js 16.2 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Motion
- **Backend:** Supabase (Postgres, Auth, Storage, RLS)
- **AI assistant:** Moonshot `kimi-k2.6` (OpenAI-compatible API), streaming
- **Design system:** `docs/camel-cement-design.md` (source of truth)
- **Build brief:** `docs/camel-cement-master-build-prompt.md`

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in credentials
npm run dev                  # http://localhost:3000
```

### Environment variables

See `.env.example`. Required for full functionality:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, used by API routes + seeds |
| `MOONSHOT_API_KEY` | Camel Build Assistant |
| `ADMIN_EMAIL` / `ADMIN_SEED_PASSWORD` | Admin account seeding |

The site runs gracefully in demo mode when Supabase/Moonshot are not
configured (forms return local references, assistant shows offline guidance).

### Database setup

```bash
supabase link --project-ref <ref>
npm run db:push                                        # apply migrations
npx dotenv -e .env.local -- npm run seed:admin         # create admin user
npx dotenv -e .env.local -- npm run seed:content       # products, articles, FAQs
```

### Admin dashboard

Sign in at `/admin/login` with the seeded admin account (`ADMIN_EMAIL`).

## Project structure

```
app/(site)/        Public website (home, products, calculator, news, ...)
app/admin/         Administration dashboard (Supabase Auth protected)
app/api/           Validated API routes (quotes, orders, contact, chat, ...)
components/site/   Brand layout primitives (Section, ProductCard, ...)
components/ui/     shadcn/ui components
lib/               Products, articles, FAQs, calculators, Supabase clients
supabase/          Migrations (schema + RLS + storage buckets)
scripts/           seed-admin.ts, seed-content.ts
docs/              Design system + master build brief
public/            Brand assets (logos, product bags, hero video)
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Notes

- Missing photography renders as designed "coming soon" skeletons; drop real
  images into `public/` and swap the `ComingSoonImage` usages.
- Privacy and Terms pages are structured for legal review before launch.
- Do not commit `.env.local`.
