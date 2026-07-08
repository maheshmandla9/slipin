# SlipIN (working name — display name lives in `src/config/app.ts`)

Anonymous personality-transformation web app: design a target persona on a layered SVG avatar, chat with it, and practice becoming it through a daily loop. All user data lives in localStorage — no accounts, no database. Spec: [docs/PRD.md](docs/PRD.md) (canonical) · [docs/BRD.md](docs/BRD.md) (context) · [docs/architecture.md](docs/architecture.md) (how it works).

## Setup

```bash
npm install
npm run dev        # Vite dev server on :5173
npm run build      # typecheck + production build
npm run typecheck  # tsc only
```

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

## Deploy

Vercel: import the repo, set env vars above, deploy. The SPA is static; `/api/chat` and `/api/plan` deploy as Edge Functions automatically. *(Edge functions arrive in Phase 3.)*

## Build status

- [x] Phase 0 — repo + docs
- [x] Phase 1 — scaffold, avatar (5 zones), trait/emotion library, packs, free-hand builder, localStorage persistence
- [x] Phase 2 — deterministic plan engine (focus-trait rotation, difficulty ramp, if-thens, wear scripts) + daily loop (intent → wear → missions → debrief) + streaks
- [x] Phase 3 — `/api/chat` + `/api/plan` edge functions: persona system prompt, moderation in+out (keyword + Haiku classifier), per-IP rate cap, 20 msgs/day/persona, 3 polishes/day, daily $ budget hard-stop, kill-switches, Sentry; frontend degrades gracefully when any of it is off
- [x] Phase 4 — evidence log + streak dots, 30-day then-vs-now report, PNG persona card export, JSON export/import, corrupt-storage recovery banner, PostHog events (no-SDK REST), Sentry FE (envelope API)
- [ ] Phase 5 — QA + launch
