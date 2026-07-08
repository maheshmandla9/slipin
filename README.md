# SlipIN (working name — display name lives in `src/config/app.ts`)

Anonymous personality-transformation web app: design a target persona on a layered SVG avatar, chat with it, and practice becoming it through a daily loop. All user data lives in localStorage — no accounts, no database. Spec: [docs/PRD.md](docs/PRD.md) (canonical) · [docs/BRD.md](docs/BRD.md) (context) · [docs/architecture.md](docs/architecture.md) (how it works).

## Setup

```bash
npm install
npm run dev        # Vite dev server on :5173 — frontend AND /api/* functions, no other tools needed
npm run build      # typecheck + production build
npm run typecheck  # tsc only
```

`npm run dev` is the only local dev command you need. A small Vite plugin (`vite-plugin-local-api.ts`) runs the `/api/*.ts` edge functions in-process, so `/api/chat` and `/api/plan` work locally without the Vercel CLI, `vercel dev`, or any second server. Put server secrets in `.env.local` (git-ignored) — the plugin loads it into `process.env` for the functions; Vite's usual `VITE_`-prefixed vars still work the normal way for the frontend. Vercel/Netlify only enter the picture at actual deploy — they're hosting, not a dev dependency.

## Environment variables

All optional — every integration no-ops gracefully when its key is absent. LLM features (chat, plan polish) need the API key; the rest of the app works fully offline without any env.

| Var | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | edge fns | Claude API key (server-side only, never in browser) |
| `MODEL` | edge fns | Claude model id, default `claude-haiku-4-5` |
| `CHAT_ENABLED` | edge fns | Kill-switch: set `false` to disable /api/chat |
| `POLISH_ENABLED` | edge fns | Kill-switch: set `false` to disable /api/plan polish |
| `DAILY_BUDGET_USD` | edge fns | Daily LLM spend hard-stop (default 5) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | edge fns | Counter store for per-IP caps + cost counter (no user data). Absent → best-effort in-memory caps |
| `SENTRY_DSN` | edge fns | Error reporting (server) |
| `VITE_SENTRY_DSN` | frontend | Error reporting (browser) |
| `VITE_POSTHOG_KEY` | frontend | Product analytics |

## Deploy (Vercel)

Vercel is used only for hosting/deploy, not local dev (see Setup above).

1. Push the repo to GitHub and **Import Project** in Vercel (framework auto-detects Vite; `vercel.json` handles SPA rewrites, `/api/*.ts` deploy as Edge Functions automatically).
2. Set env vars (Project → Settings → Environment Variables): `ANTHROPIC_API_KEY` at minimum; add Upstash vars for real cross-region caps ([upstash.com](https://upstash.com) free tier → create a Redis DB → copy REST URL + token).
3. Deploy. Smoke-test: create a persona → chat once → toggle `CHAT_ENABLED=false` and confirm the graceful notice.

Ops levers in production: `CHAT_ENABLED` / `POLISH_ENABLED` kill-switches, `DAILY_BUDGET_USD` hard-stop (default $5/day), per-IP caps enforced in the functions. Errors land in Sentry (`fn:chat` / `fn:plan` tags); funnel lands in PostHog.

## Build status — MVP complete

- [x] Phase 0 — repo + docs
- [x] Phase 1 — scaffold, avatar (5 zones), trait/emotion library, packs, free-hand builder, localStorage persistence
- [x] Phase 2 — deterministic plan engine (focus-trait rotation, difficulty ramp, if-thens, wear scripts) + daily loop (intent → wear → missions → debrief) + streaks
- [x] Phase 3 — `/api/chat` + `/api/plan` edge functions: persona system prompt, moderation in+out (keyword + Haiku classifier), per-IP rate cap, 20 msgs/day/persona, 3 polishes/day, daily $ budget hard-stop, kill-switches, Sentry; frontend degrades gracefully when any of it is off
- [x] Phase 4 — evidence log + streak dots, 30-day then-vs-now report, PNG persona card export, JSON export/import, corrupt-storage recovery banner, PostHog events (no-SDK REST), Sentry FE (envelope API)
- [x] Phase 5 — QA (offline, LLM-down fallback, keyboard/ARIA/reduced-motion, mobile), per-module landing pages (`/m/<module>`), Vercel deploy config
