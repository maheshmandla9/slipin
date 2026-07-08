# Pending items — SlipIN

*Living checklist of things we've deliberately deferred. Not a roadmap (see PRD Part B for that) — this is the "don't forget" list. Check items off and add a one-line note when done; keep entries even after done (strike through) so we have a record of when/why.*

## Open

- [ ] **README.md — rewrite as a rich, organized doc.** Current README covers setup/env/deploy/build-status but reads as engineering notes, not a proper front door for the repo (no badges, no screenshots, no quick "what is this" for a first-time visitor). Revisit before making the repo public or handing it to anyone new.
- [ ] **PostHog `persona_requested` — no real feedback loop yet.** Requests are captured as a PostHog event only (see `src/pages/Builder.tsx`); there's no dashboard routine, email, or webhook that surfaces them to the owner. UI now carries an honest note ("not yet reviewed") so users don't think it's broken. Revisit: either (a) start periodically checking the PostHog event list, or (b) wire a notification (webhook/email) when ready.
- [ ] **Formal IP legal review before monetization** — per `docs/decisions/ADR-001-celebrity-ip-naming.md` and BRD §4.6, required before any Pro/paid tier launches (celebrity Icons packs specifically).
- [ ] **Upstash Redis for production caps** — currently falls back to best-effort in-memory counters per serverless isolate. Fine for low/dev traffic; set up a real Upstash Redis DB (free tier) before real usage volume to make rate caps and the daily budget hard-stop actually reliable across regions.
- [ ] **Confirm PostHog + Sentry keys are set in Vercel** once deployed — both no-op silently if the env var is missing, so it's easy to "launch" without realizing analytics/error-tracking aren't actually running.
- [ ] **`/m/:moduleId` landing pages are unreachable from in-app navigation** — Home's module cards link straight to `/build/:moduleId`, skipping the landing pages entirely. They still exist for external marketing links. Decide: link them from Home, or keep them landing-only for shared URLs.

## Done
*(move finished items here with the commit/date, don't delete)*

- [x] **Favicon** — Option B (avatar bust with amber-ring aura, brand purple tile) added as `public/favicon.svg`, wired via `<link rel="icon">` in `index.html`. 2026-07-09.
