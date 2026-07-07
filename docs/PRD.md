# PRD (Detailed) — SlipIN · Personality Transformation App
*08 Jul 2026 · Stage 2 of 3 · Stack approved · Consistent with BRD v3 · Supersedes lean PRD*
*Name: "SlipIN" is display-only via a single `APP_NAME` constant in `src/config/app.ts`. No hardcoded product name anywhere else — rebrand = 1 edit.*

═══════════════════════════════════
# PART A — PRD_MVP (the 4–5 week build)
═══════════════════════════════════

## 1. Summary & Goal
Anonymous web app to **design a target personality on a layered 2D avatar** (traits + emotions with intensity, from module packs or free-hand), **chat with that persona** to feel it, and receive a **doable daily transformation plan** (wear-sessions, micro-missions, debriefs) with a **visible evidence log** and a **30-day "then vs now" report**.
**Win condition:** ≥15% D7 return · ≥50% complete first wear-session · ≥40% try Persona Chat.

## 2. Users & Roles
| Role | Needs | Notes |
|---|---|---|
| Anonymous user (only role at MVP) | Create persona ≤3 min; feel it via chat; get daily plan; see proof of change | No login; localStorage identity |
| Module lens (same user, different framing) | Actor · Self-transform · Student · Emotional Mgmt · Animal · Physical-prep · Manifestation · Free-hand | Chosen at entry; sets default pack + copy tone |

## 3. Features (MVP = P0 only)
| # | Feature | User value | Priority |
|---|---|---|---|
| F1 | Layered 2D SVG avatar, 5 body zones (head=beliefs, chest=emotions, mouth=voice, hands=actions, feet=habits) | See yourself "wear" traits | P0 |
| F2 | Trait + emotion library w/ intensity sliders (Hawkins-laddered) | The building blocks | P0 |
| F3 | Module packs (7) + free-hand builder, JSON presets | 3-min activation, per-niche entry | P0 |
| F4 | Plan engine — template-first, optional LLM polish | Personalized doable daily plan | P0 |
| F5 | Daily loop — morning intent → wear session → micro-missions → evening debrief | The transformation engine | P0 |
| F6 | Persona Chat (text, capped) w/ moderation | Feel the persona; feedback channel | P0 |
| F7 | Evidence log + streaks + 30-day "then vs now" report | Retention + proof + viral share | P0 |
| F8 | Safety layer — curated-only traits, chat moderation, non-clinical disclaimers, crisis links | Trust + regulatory shield | P0 |
| F9 | localStorage persistence + JSON export/import | Anonymous continuity across sessions | P0 |
| F10 | Shareable persona card (image export) | Free viral loop + retention hook | P0 |

## 4. User Flows
**Primary:**
`Land → pick module → pick pack OR free-hand → traits/emotions snap onto avatar zones → name persona → (optional) chat with persona → generate plan → first wear-session (3–5 min) → enter daily loop → evening debrief → evidence log grows → day-30 report → share card`

**Returning-day:**
`Open → "Who do I want to be today?" intent → wear session → missions surface → complete in real life → tap done → debrief → streak++`

**Fallback (LLM down):**
`Chat disabled w/ notice · plan falls back to pure template · everything else works offline`

## 5. Tech Stack + WHY (approved)
| Layer | Choice | Why | Rejected |
|---|---|---|---|
| Dev env | Claude Code | Agentic build from dev-prompt | Cursor |
| Frontend | React 18 + Vite + TypeScript + Tailwind | Light SPA, no SSR, typed schemas | Next.js (SSR unneeded) |
| Avatar | Inline SVG + Framer Motion | Free 2D layers, zone hit-targets, "wearing" animation | Three.js (deferred), Canvas |
| State | Zustand + persist middleware → localStorage | Tiny, built-in persistence | Redux |
| Backend | None except 1 Edge Function | Anonymous + local-first = $0 | Supabase now |
| LLM proxy | Vercel Edge Fn → Claude Haiku 4.5 (`claude-haiku-4-5`) | Hides key, rate caps, moderation hook, model swap via env | Direct client (leaks key) |
| FE calls | fetch → `/api/chat`, `/api/plan` | Only 2 endpoints | GraphQL/webhooks |
| Orchestration | None | Single-call pattern | LangGraph/n8n |
| Hosting | Vercel free | $0, functions co-located | CF Pages, Railway |
| Errors/analytics | Sentry free + PostHog free | KPIs + funnel from day 1 | GA4 |
| Content | Static JSON in repo | Version-controlled = the moat | Headless CMS (later) |

**Run cost:** $0 hosting + $5–25/mo LLM.

## 6. Architecture Flow (see diagram in chat; textual form below)
```
Browser SPA (React + Vite + TS + Tailwind)
 ├─ SVG Avatar Canvas ─┐
 ├─ Library / Packs UI ─┼─ Zustand store ── persist ──► localStorage {personas, plans, logs, evidence}
 ├─ Daily Loop UI ──────┘
 ├─ Static JSON (traits, emotions, packs, techniques, plan templates) — bundled
 ├─ fetch POST /api/plan ─► Vercel Edge Fn ─► [budget check → moderation] ─► Claude Haiku (polish) ─► JSON plan
 ├─ fetch POST /api/chat ─► Vercel Edge Fn ─► [cap check → moderation in] ─► Claude Haiku (persona sys-prompt) ─► [moderation out] ─► reply
 │        every fn: per-IP rate cap · daily cost counter w/ hard stop · kill-switch env flag · error → Sentry
 └─ Events (funnel, missions, debriefs, shares) ─► PostHog
```

## 7. Data Model (detailed)
```ts
Trait { id, name, zone:'head'|'chest'|'mouth'|'hands'|'feet',
        category, description, reframeScript, ifThenTemplate, hawkinsLevel? }
EmotionalQuality { id, name, hawkinsLevel:number, intensityRange:[min,max] }
Technique { id, name, source, steps[], durationMin }         // static library
PlanTemplate { id, module, weekStructure[], missionPool[], wearScriptTemplate }
Pack { id, module, name, description, traitIds[], emotions:[{id,intensity}],
       planTemplateId, gesture, identityScript, animalMeta? }
Persona { id, name, module, traitIds[], emotions:[{id,intensity}],
          gesture, identityScript, createdAt }
Plan { id, personaId, weeks:[{ focusTraitId, missions:[{id,text,difficulty}],
       wearScript, ifThens:[{trigger,response}] }] }
DailyLog { date, personaId, intentDone, wearDone, missionsDone[], debrief:{score,win,slip} }
EvidenceEntry { id, date, personaId, text, missionId? }
AppState { personas[], activePersonaId, plans[], logs[], evidence[], streak, firstSeenAt }
```
Persistence: single JSON blob in localStorage; export/import = download/upload that blob.

## 8. LLM Prompt Architecture
- **Persona Chat** — system prompt built at request time from persona JSON:
  `"You are {name}, a persona embodying {traits w/ intensities}. Signature gesture: {gesture}. You respond in-character as a rehearsal mirror to help the user feel what being you is like. You are NOT a companion, therapist, or romantic partner. Keep replies short, embodied, first-person. If asked for harmful/clinical/romantic content, redirect to the rehearsal purpose."`
  - Input + output run through moderation; max 20 msgs/day/persona; reply cap ~150 tokens.
- **Plan polish** — template engine builds the plan deterministically; LLM optionally rewrites mission/script wording for the persona's voice. Prompt returns **strict JSON only** (parsed safely; on parse-fail → keep template text). Max 3 polishes/day.
- **Model:** `claude-haiku-4-5` via `MODEL` env var (swap without code change).

## 9. Non-Functional
| Concern | Spec |
|---|---|
| Auth | None (anonymous) |
| Privacy | No PII; chat not persisted server-side; localStorage only |
| Caps | Chat 20/day/persona · plan-polish 3/day · per-IP rate limit on fns |
| Cost guard | Daily $ counter in fn; hard-stop + kill-switch env flags (`CHAT_ENABLED`, `POLISH_ENABLED`) |
| Latency | Chat <3s; app fully usable offline except chat/polish |
| A11y | Keyboard nav, ARIA on zones, reduced-motion support |
| Responsive | Mobile-web first-class; PWA-ready structure (PWA itself Phase 4) |

## 10. Logging & Safety (intent — enforced by dev-prompt)
- **Error logging:** Sentry on FE + edge fns.
- **Action logging:** PostHog events — persona_created, wear_session_done, mission_done, debrief_done, chat_msg, plan_generated, report_viewed, card_shared, moderation_blocked, llm_error.
- **Fail-safes:** LLM down → template-only plans + chat disabled notice; localStorage full/corrupt → safe reset w/ export offer; fn budget hit → graceful "try later".
- **Safety content:** curated-only traits at MVP (no free-text traits); input+output moderation on chat; persistent footer disclaimer (self-development, not therapy); `/crisis` resources page; block harmful/clinical/romantic persona directions.

## 11. Build Sub-Phases (→ dev-prompt)
| Wk | Sub-phase | Exit criteria |
|---|---|---|
| 1 | Scaffold (Vite/TS/Tailwind, `APP_NAME` config, routing, Zustand+persist) · SVG avatar w/ 5 zones · trait+emotion library · packs load | Persona creatable, dressed on avatar, saved locally |
| 2 | Plan template engine · daily loop UI (intent/wear/missions/debrief) · streaks | Full loop playable offline |
| 3 | Edge fns `/api/chat` + `/api/plan` · persona sys-prompt builder · moderation · caps · cost counter · kill-switches | Persona Chat live under caps; plan polish working w/ template fallback |
| 4 | Evidence log · 30-day report · shareable card export · safety pages/disclaimers · Sentry+PostHog wired | All P0 done, instrumented |
| 5 | QA (offline, fallback, a11y, mobile) · soft-launch landing pages per module · deploy | Live on Vercel, funnel tracked |

## 12. Open Questions / Assumptions
- Logo/favicon: user supplies; placeholder slot + `APP_NAME` built in.
- LLM = Anthropic (Haiku 4.5); swap via `MODEL` env.
- English-only at MVP; content JSON structured for i18n later.
- Trait/technique library content authored in parallel (curated dataset = the moat) — dev-prompt scaffolds the schema + seed set; you expand content over time.

═══════════════════════════════════
# PART B — PRD_Full (roadmap beyond MVP)
═══════════════════════════════════

## Phases
| Phase | Scope | Stack delta | Exit criteria |
|---|---|---|---|
| 1 — MVP (wk 1–5) | Part A | — | D7 ≥15%, wear-session ≥50% |
| 2a — Playground (+2–3 wk) | Max-3 personas in a scene (dinner/movie/cooking/conflict); single "screenwriter" LLM call roleplays all 3; user injects prompts mid-scene; Pro-tier | Same edge-fn pattern; new `/api/scene` | Scenes/user ≥2, cost/scene ≤$0.05 |
| 2b — Audio scene-partner (+2–3 wk) | Live voice rehearsal, Actor module, EN-only, capped minutes, Pro-tier | Realtime voice (OpenAI realtime-mini class or STT+LLM+TTS), WebRTC transport | Turn latency <1.2s, cost ≤$0.15/min |
| 3 — Accounts & sync | Supabase auth + Postgres + RLS; migrate localStorage → cloud; cross-device | Supabase free→Pro | Signup ≥25% of D30 users |
| 4 — Monetize + PWA | Stripe; Pro ($3–5/mo: unlimited personas/chat, playground, voice, deep library); PWA install | Stripe, service worker | First 100 payers |
| 5 — Growth & B2B2C | Coach/drama-school dashboards; shareable/community packs; local languages incl. voice | i18n, coach role, optional CMS | First B2B2C deal |

## Full data-model additions (Phase 3+)
`User, Subscription, Scene{personaIds[], scenario, transcript}, VoiceSession{minutes, cost}, CoachOrg{memberIds[]}`

## Full architecture delta
`SPA ─► Supabase (auth+DB+RLS) · Stripe webhooks ─► edge fn · Voice: browser WebRTC ─► realtime voice API (Pro-gated, capped) · same kill-switch + per-user monthly budget on every paid call`

## Full non-functional adds
- RLS on all user rows; GDPR data-deletion endpoint; voice never stored by default.
- Per-user monthly LLM/voice budget enforced server-side.
- Feature flags per paid capability for controlled rollout.
