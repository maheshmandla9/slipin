# PRD (Detailed) — SlipIN · Personality Transformation App
*08 Jul 2026 · Stage 2 of 3 · Stack approved · Consistent with BRD v4 · Supersedes lean PRD*
*Name: "SlipIN" is display-only via a single `APP_NAME` constant in `src/config/app.ts`. No hardcoded product name anywhere else — rebrand = 1 edit.*

## Document Control (docs-as-code — update this table with every spec change)
| Ver | Date | Change | Status |
|---|---|---|---|
| 1.0 | 2026-07-08 | Initial detailed PRD; Parts A (MVP) + B (roadmap) | Part A **SHIPPED** same day (Phases 0–5 complete) |
| 1.1 | 2026-07-08 | As-built deltas recorded: chat split into two modes — talk to the persona as a real person + "Your Personal Guide" coach (§8 updated) · local dev runs /api fns inside `npm run dev` via Vite plugin (no Vercel CLI) · floating-quotes content type added | Shipped |
| 1.2 | 2026-07-08 | **Part C added — Module Expansion**: Mimicry, Celebrity Icons/Legends, Movie/TV Characters, Anime Characters, Actor voice/body-language guidance, "request a persona" button. IP/publicity-rights tier strategy per BRD v4 §4.6 | **DRAFT — naming-strategy decision + build approval pending** |

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

## 8. LLM Prompt Architecture *(updated v1.1 — as-built)*
- **Chat — two modes, one endpoint** (`mode: 'persona' | 'guide'` on `/api/chat`); both system prompts built at request time from persona JSON (`buildPersonaPrompt` / `buildGuidePrompt` in `api/_lib/persona.ts`):
  - **Persona mode** — "You ARE {name}" — a real person who genuinely has the chosen traits: natural, embodied, human conversation; traits shape *how* they speak, not a checklist; replies vary in length (max_tokens 512).
  - **Your Personal Guide mode** — a coach for the journey: what to practise today and how — tricks, tiny rehearsals, if-then plans, debriefs, self-assessments; tight and practical (max_tokens 320).
  - Both share non-negotiable boundaries: not a companion/romantic partner, no clinical advice, refuse harm. Input + output moderation; max 20 msgs/day/persona (shared across modes).
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
| 1 — MVP (wk 1–5) | Part A | — | D7 ≥15%, wear-session ≥50% — **SHIPPED** |
| 1.5 — Module Expansion | Part C (Mimicry · Icons · Movie/TV · Anime · Actor upgrades) | Content JSON + 4 landing pages + small schema delta; **no infra change** | Per-module landing→persona conversion; `persona_requested` demand volume |
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

═══════════════════════════════════
# PART C — Module Expansion (v1.2 · DRAFT — build pending approval)
═══════════════════════════════════
*Legal/IP background and tier definitions: BRD v4 §4.6. Positioning guardrail (BRD §3.3) applies unchanged: transformation training, never entertainment chat.*

## C1. Scope
| # | Addition | Type | Legal weight |
|---|---|---|---|
| E1 | Actor Prep: body-language & voice-imitation guidance (text drills only — no AI audio) | Content upgrade, existing module | None |
| E2 | **Mimicry** module — the *skill* of imitation: observation → posture → gesture → voice → speech-pattern ladder; study subject is user-chosen | New module | Light (we ship method, not celebrity content) |
| E3 | **Celebrity Icons/Legends** — adopt the mindset/qualities of iconic real figures | New module | Tiered (T0–T2) |
| E4 | **Movie/TV Characters** (Indian + international) | New module | T3 (highest) |
| E5 | **Anime Characters** (doubles as cosplay/comic-con prep) | New module | T3 |
| E6 | "Request a persona" button on E2–E5 pages | Micro-feature | None |

## C2. Design rules (bind all four new modules)
1. **Naming per rights tier** (BRD §4.6): T0 real names · T1 "inspired by X" · T2 archetype titles + nominative "inspired by" descriptions · T3 archetype-only in shipped content (persona *name* field stays user-editable free text — users may rename locally; user content ≠ published content).
2. **Framing:** every pack sells the *qualities* ("train the discipline Ronaldo is known for"), never impersonation-as-entertainment.
3. **Chat guardrail (T1/T2 real people):** prompt addition — never fabricate quotes, private facts, or endorsements of the real person; you are an unofficial training persona. UI shows a one-line "Unofficial practice persona — no affiliation or endorsement" disclaimer.
4. **Exclusions & flags:** Gandhi excluded (Emblems & Names Act) · Mahabharata figures = respectful non-worship framing · politically charged figures (Shivaji, Bhagat Singh) require extra copy review · no images, no voice, no logos, no catchphrases of protected figures anywhere.
5. **No AI voice cloning** — guidance is text; audio imitation is out of scope (ELVIS-Act class laws + Phase-2 cost).

## C3. Data model & API delta (small)
```ts
ModuleId += 'mimicry' | 'icons' | 'screen' | 'anime'
Pack += inspiration?: {
  label: string                       // "Inspired by Cristiano Ronaldo"
  figure: string                      // canonical name — internal (moderation, request matching)
  rightsTier: 'T0'|'T1'|'T2'|'T3'
  status: 'public-domain'|'deceased'|'living'|'fictional'
}
Persona += inspiration?               // copied from pack at creation; sent on wire;
                                      // server re-validates (length caps + keyword screen)
```
- `buildPersonaPrompt`/`buildGuidePrompt` append the C2-rule-3 guardrail block when `inspiration.status` is `living` or `deceased`.
- `/api/chat` + `/api/plan`: no endpoint changes; existing caps/moderation/budget apply as-is.
- E6 request button: modal → free text (≤80 chars) → PostHog `persona_requested {text, module}`. No backend storage at this phase; real queue arrives with accounts (Part B Phase 3).

## C4. Seed roster candidates (final list validated against current interest/trend data at implementation)
- **T0 (real names, free & clear):** Marcus Aurelius · Miyamoto Musashi · Chanakya · Swami Vivekananda · Nikola Tesla · Marie Curie · Srinivasa Ramanujan · Leonardo da Vinci · Great Gama · Bheema · Arjuna · Sherlock Holmes · Albert Einstein (publicity expired; avoid trademark-styled branding)
- **T1 (inspired-by, estates active):** Muhammad Ali · Kobe Bryant · Bruce Lee · A.P.J. Abdul Kalam · Steve Jobs · Ustad Zakir Hussain · Nelson Mandela · Milkha Singh · Lata Mangeshkar · Charlie Chaplin · Ayrton Senna · Ratan Tata
- **T2 (archetype title + nominative description):** Cristiano Ronaldo · Virat Kohli · MS Dhoni · Usain Bolt · Michael Phelps · Serena Williams · Simone Biles · Rafael Nadal · Neeraj Chopra · Mary Kom · David Goggins · Shah Rukh Khan (off-screen) · Meryl Streep · Christian Bale (off-camera) · Elon Musk · A.R. Rahman · Michael Jordan · Roger Federer
- **T3 (archetype packs; examples of source inspiration only):** genius-inventor (Stark) · night-vigilante (Batman) · relentless-underdog (Rocky) · unstoppable-professional (Wick) · deduction-master (already T0 via Holmes) · free-spirit joy (Geet) · comic chaos (Gogo) · found-family ensemble (Friends) · shonen never-give-up (Goku/Naruto) · discipline-obsessed fighter (Baki) · silent-grit swordsman (Levi) · kind-perseverance (Tanjiro) · routine-is-power (Saitama) · hard-work-beats-talent (Rock Lee)

## C5. Effort & cost (no blow-up)
- **Code:** Low-Med, ~1–2 days — ModuleId + packs + templates + 4 landing pages + prompt guardrail + request modal.
- **LLM run cost:** unchanged mechanics; same per-user caps and daily budget hard-stop. Growth in spend = growth in users, linear, already modeled (BRD §10).
- **Real cost = content curation:** each pack needs traits mapping, gesture, identity script, missions. Seed 4–6 packs/module; expand weekly (content = the moat, §12).
- **Bundle:** +10–30 KB JSON — negligible.

## C6. Success metrics
Per-module: landing→persona-created conversion · first wear-session rate · `persona_requested` volume ranked (demand signal for roster expansion) · icons share-card rate (viral loop).

## C7. Open questions (Part C)
1. **Naming strategy (T2/T3) — OWNER DECISION PENDING** (options + recommendation presented 08 Jul 2026).
2. Final seed roster → validate against current trending-interest data at implementation time.
3. **Formal legal review before monetization** — commercial use strengthens publicity-rights claims; revisit tiers before Pro tier launches.
4. `screen` vs two separate module IDs for Indian vs international cinema — decide at implementation (single module with tags preferred).
