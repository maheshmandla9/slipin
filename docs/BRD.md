# BRD v4 — "SlipIN" (working name) · Personality Transformation App
*Updated: 08 Jul 2026 · Stage 1 of 3 (BRD → PRD → Dev Prompt) · Status: GO (conditional) · Supersedes v3*

**v4 changes (08 Jul 2026):** Module Expansion added — Mimicry, Celebrity Icons/Legends, Movie/TV Characters, Anime Characters as new modules + voice/body-language guidance folded into Actor Prep (§4.3) · new §4.6: IP & publicity-rights tier strategy for real-person and fictional-character personas · new risk rows (§15). *Expansion status: spec drafted; naming-strategy decision + build approval pending (see PRD Part C).*

**v3 changes:** market-fit evaluation folded in (§3) · Romantic Partner module **dropped from roadmap** · Audio scene-partner + 3-persona Playground confirmed as **Phase 2, Pro-tier, gated** · positioning guardrail hardened as regulatory shield · voice/LLM economics grounded with current data.

---

## 1. Problem Statement
- **Pain:** People who want to change who they are (habits, emotional patterns, identity) have no structured, visual, gamified way to *design* the target personality and get a doable daily practice to become it. Habit apps track *doing*; nothing mainstream tackles *being*.
- **Who feels it most:** actors (ad-hoc character prep), self-transformation seekers (Dispenza/Hawkins/Atomic-Habits readers with no applied tool), students (shyness, procrastination, focus), emotional self-managers (anger, impulse), manifestation/goal audience, people starting physical transformation (mind-first prep).

## 2. Why Solve / Why Now
- Mental-fitness market growing ~15–20% CAGR; identity-based change is the dominant self-help narrative.
- GenAI makes a "coach + persona you can talk to" cheap per-call — previously required humans.
- Module architecture lets one engine serve many audiences → cheap multi-niche acquisition.
- First-mover window on the visual metaphor: *dress a body with traits, then talk to who you built.*

## 3. Market-Fit Evaluation (decision basis for this version)
### 3.1 Verdict
| Dimension | Read |
|---|---|
| Real need | **Strong** — identity-first change + doable practice is genuinely underserved |
| Market fit (core) | **Good, unproven** — new behavior ("design a personality"); must validate via D7/D30 |
| Uniqueness | **High for core, low for companion-style features** |
| Growth | **Good** — modules = multi-niche channels; actors + students underserved |
| Overall | **GO on core · Phase-2 gated · Romantic module cut** |

### 3.2 The moat
- Novel visual metaphor (layered avatar) **+** depth of curated technique engine (acting + Dispenza + CBT + Hawkins + Stoic/Franklin methods). The metaphor is copyable; the curated method + evidence system + brand are not (yet). **Speed + content depth = defensibility.**

### 3.3 Why Romantic Partner was dropped (recorded for posterity)
- Least unique piece (Replika 40M+ users, Nomi, Kindroid, Character.AI own the space).
- Heavy, fast-moving legal exposure that would attach to the *whole* product:

| Signal (as of mid-2026) | Status |
|---|---|
| CA SB 243 | Live Jan 1 2026 — $1,000+/violation, private right to sue |
| NY companion law | In force Nov 5 2025; ~$15k/day noncompliance |
| Federal GUARD Act | Cleared Senate Judiciary 22-0 (Apr 30 2026); would ban companions for under-18 |
| Illinois | Bans AI from delivering therapy ($10k/violation) |
| Replika | €5M GDPR fine + FTC complaint (manipulative upsell) |
| Character.AI | Sued after teen suicide; ruled a "product," not protected speech |
| AI chat logs | Now treated as discoverable court evidence (US) |

- Companion framing also collapses our "self-development, not treatment" positioning — which is itself our regulatory shield. **Decision: cut from roadmap.** Any future pursuit = separate app, separate brand, age-gating, geofencing, legal review.

### 3.4 GTM wedge order (growth plan)
`Actors → Students → Self-transformation → Manifestation`
- Actors = sharpest pain, thinnest competition, tight word-of-mouth community.
- Students = viral animal packs.
- Each pack = its own landing page + SEO/social channel on one engine.
- Viral loops: shareable persona card, animal persona, 30-day "then vs now" report.

## 4. Product Concept & Core Engine
### 4.1 The visual: layered 2D avatar (3D dropped for MVP)
- SVG human outline ("the sleeve"); traits attach as chips/aura layers on body zones:
  - head = beliefs/thoughts · chest = emotions (intensity sliders) · mouth = voice/language · hands = actions · feet = habits/grounding
- Zero 3D cost; CSS/SVG animation gives the "wearing it" feel; upgradable to 3D post-validation.

### 4.2 Transformation engine (how users put it on in real life)
Built on: identity→behavior (Dispenza/Clear) · "act as if" (James/Adler) · mental-rehearsal neuroscience · self-perception theory (Bem).

| Source | Technique | In-app form |
|---|---|---|
| Stanislavski | Magic If | Wear-session script: "If I were [persona], how would I enter this room?" |
| M. Chekhov | Psychological gesture | Signature physical move per persona |
| Acting craft | Voice & walk drills | 30-sec micro-drills in-character |
| Dispenza | Morning rehearsal + elevated emotion | Guided 3–5 min script (text/audio) |
| Dispenza/meditation | Pattern interrupt | "Old you or new you?" mid-day catches |
| CBT | Cognitive reframing | Reframe scripts shipped with each trait card |
| Gollwitzer | If-then implementation intentions | Auto-generated per trait: IF trigger → THEN persona response |
| NLP/mentalists | Anchoring | Physical trigger set in rehearsal, fired before hard moments |
| "Batman effect" | Third-person self-talk | Persona named; "What would [Name] do?" coaching |
| Stoics | Morning premeditation + evening review | Daily open/close ritual + in-character score |
| Ben Franklin | One-virtue-per-week | Focus-trait rotation — never all traits at once |
| Deity yoga / imitatio | Full-identity immersion | "Deep wear" 10-min dissolve-old / assume-new session |
| Hawkins map | Emotion laddering | Intensity sliders on his scale; plans move one rung at a time |
| Behavioral design | Environment cues | Persona-card wallpaper, desk-object anchor checklist |

**Daily loop:** Morning intent ("Who do I want to be today?") → Wear session (rehearsal + gesture + anchor) → Live in character (micro-missions, if-then plans, anchor fires, pattern interrupts) → Evening debrief (score, one win, one slip) → ↻ next day, trait-of-week rotates.

### 4.3 Modules & ready-made packs
One engine, many skins — user picks a module at entry (or free-hand builds):

| Module | Audience | What's different |
|---|---|---|
| Actor Prep | Actors/drama students | Character sheet, backstory Qs, voice/walk drills, role deadline mode |
| Self-Transformation | Dispenza-style seekers | Full daily loop, deep-wear sessions, identity scripts |
| Student | 15–24 | Shyness/procrastination/focus packs, gamified streaks, animal fun layer |
| Emotional Management | Anger/impulse/anxiety self-managers | Pattern interrupts, anchors, laddering front-and-center; strong non-clinical framing |
| Animal Personalities | All (fun/viral layer) | Lion courage, owl calm, dolphin play → mapped to human trait sets; shareable |
| Physical Transformation | Gym starters / trainers' clients | "Mind before body" 2-week identity prep; B2B2C hook for coaches |
| Manifestation | Dreamers/goal-setters | See 4.4 |
| Free-hand | Power users | Build from the full trait/emotion library |
| Mimicry *(v4)* | Performers, fans, social learners | The **skill** of imitation: observation → posture → gesture → voice → speech-pattern ladder. Teaches technique; the study subject is user-chosen. Legally light (we ship method, not celebrity content) |
| Celebrity Icons/Legends *(v4)* | Aspirational self-improvers, sports/cinema/art/business fans (India + global) | **Identity** module: adopt the mindset/qualities of iconic figures (living, deceased, historical, mythological) — subject to §4.6 rights tiers. "Request a persona" demand-capture button |
| Movie/TV Characters *(v4)* | Film fans, actors, Indian + international cinema | Fictional-character personas — §4.6 Tier-3 handling (archetype packs; user may rename locally) |
| Anime Characters *(v4)* | Anime fans; cosplay/comic-con prep | Same T3 handling; cosplay angle = embodiment practice with a natural event deadline (mirrors Actor "role deadline" mode) |

*(v4)* Actor Prep additionally gains **body-language & voice-imitation guidance** — text drills/techniques only (observation ladders, voice/walk exercises). AI audio voice-cloning is explicitly out of scope (cost + voice-rights laws, e.g. Tennessee ELVIS Act).

- Packs = curated JSON presets (traits + intensities + plan template) → near-zero build cost per new pack, high perceived value, each is a marketing channel.

### 4.4 Manifestation module
- Framing: **manifestation = identity rehearsal + attention priming + aligned action** (grounded, not magical thinking):
  - Future-self visualization scripts (vivid, sensory, emotion-loaded)
  - Identity/process affirmations ("I am becoming someone who…") + interrogative self-talk ("Will I…? How?")
  - Daily "evidence hunt" (log 1 thing that matched the vision) — trains selective attention
  - Gratitude-forward emotion work (feeling as if done)
  - **Aligned-action bridge:** every vision auto-generates one tiny real-world step/day — the results driver
- Honest positioning: we sell the psychology (expectancy, priming, consistent action), no guaranteed miracles.

### 4.5 Persona Chat — talk to who you built (MVP)
- After creating a persona, user chats (text) with it: "How do you feel before a job interview?" → replies in-character per traits+intensities.
- **Cheap & simple:** single LLM call with a persona system-prompt from the trait JSON. No agent framework. Haiku-class ≈ $0.001–0.003/message. Doubles as real-time feedback: user *feels* the persona before committing.
- Guardrails: rehearsal-mirror framing (coach-in-costume, not a companion), trait safety filter, daily message caps, no romantic/companion mode.

### 4.6 Real-person & fictional-character personas — IP / publicity-rights strategy *(v4)*
The expansion modules trade on recognizable figures, which imports two distinct legal regimes. **Positioning guardrail applies unchanged:** these are transformation-training personas ("train the mindset of X"), never entertainment chat ("talk to X for fun") — the framing that keeps us out of the Character.AI legal/brand profile documented in §3.3.

**Legal background (as of mid-2026):**
| Signal | Relevance |
|---|---|
| Anil Kapoor v. Simply Life (Delhi HC 2023) | India protects celebrity name/voice/likeness **explicitly incl. AI misuse**; Bachchan 2022 similar. India = core market → real enforcement culture |
| California post-mortem publicity right (70 yrs) · NO FAKES Act (federal, pending) | Deceased-celebrity AI replicas increasingly regulated in the US |
| Tennessee ELVIS Act | Voice cloning of real people restricted → AI audio imitation stays out of scope |
| Hebrew Univ. v. GM (Einstein) | Post-mortem rights DO expire — long-dead figures are largely clear (trademarks may persist on names) |
| India Emblems & Names Act 1950 | **Mahatma Gandhi excluded from roster** — commercial use of his name/image restricted by statute |
| Well-delineated character doctrine + studio trademarks | Named fictional characters (Marvel/DC/anime/Bollywood) = copyright + TM exposure; most litigious owners in the space |

**Risk tiers → handling:**
| Tier | Who | Handling |
|---|---|---|
| T0 — public domain / mythological / historical | Marcus Aurelius, Musashi, Chanakya, Vivekananda, Tesla, M. Curie, Ramanujan, Great Gama, Bheema, Arjuna, Sherlock Holmes (PD 2023) | Real names in pack titles; full first-person chat |
| T1 — deceased, active estates | Ali, Kobe, Bruce Lee, Kalam, Jobs, Chaplin, Zakir Hussain, Mandela | "Inspired by X" naming; no images/voice/likeness; UI disclaimer; estate-sensitivity list maintained (Lee, Kahlo, Ali estates litigious) |
| T2 — living celebrities | Ronaldo, Kohli, SRK, Musk, Streep, Goggins, Phelps, Bolt | Archetype pack titles + nominative "inspired by X's publicly documented mindset" description; UI disclaimer; anti-defamation prompt guardrail (no fabricated quotes/private facts/endorsements) |
| T3 — protected fictional characters | Marvel/DC, Goku, Naruto, Geet, Gogo, John Wick, Friends cast | Archetype packs only — no protected names/logos/catchphrases in shipped content; persona name field is user-editable free text (user's local naming ≠ our published content) |

**Additional flags:** religious sentiment (Mahabharata figures → respectful, non-worship framing) · political sensitivity in India (Shivaji, Bhagat Singh) · **formal legal review required before monetization** (commercial use materially strengthens publicity claims).

**DECISION (08 Jul 2026, ACCEPTED — full analysis in docs/decisions/ADR-001):** real people keep real names via attribute-titles ("[X] Mindset", "[X]'s Energy", "The [X] Blueprint") + no-likeness policy + disclaimers + anti-defamation chat guardrails; fictional characters ship archetype-only with a user-filled "inspired by" field (protected names never in the public bundle); per-pack/per-module kill-flags + comply-fast takedown SOP (one letter costs one pack, never the product).

## 5. Effectiveness & Real-World Results Strategy
- **Activation ≤3 min:** pick module → pick pack → avatar dressed → first wear-session. No signup wall.
- **Tiny-first:** day-1 mission ≤60 sec; difficulty ratchets from debrief scores.
- **Evidence log = retention core:** every mission + evidence-hunt entry stacks into a visible "proof I'm changing" timeline (self-perception theory weaponized).
- **One trait/week focus** prevents self-help overwhelm-and-quit.
- **Real-world anchoring:** every in-app action maps to an out-of-app act — the app launches life reps, not screen time.
- **30-day "then vs now" report:** scores trend + evidence highlights → shareable, doubles as viral loop.

## 6. Objective
**Let anyone design the person they want to become, feel it (chat with it), and get a doable daily practice — with visible real-world proof of change within 30 days.**

## 7. Target Audience

| Segment | Region | Age | Savviness | Adoption driver |
|---|---|---|---|---|
| Actors / drama students | US, UK, India | 18–40 | Med-High | Fastest structured role prep + scene-partner (Ph2) |
| Self-transformation seekers | Global EN | 22–50 | Med | Applied Dispenza/Hawkins tool |
| Students | India, SEA, US | 15–24 | High | Gamified confidence/focus packs, animal fun |
| Emotional self-managers | Global | 20–45 | Med | Private, anonymous, non-clinical |
| Manifestation/goal audience | Global EN | 20–45 | Med | Grounded manifestation w/ action bridge |
| Coaches/trainers (B2B2C, later) | Global | 28–55 | Med | Mind-prep before body programs |

- **Not targeted:** diagnosed mental-illness populations. Self-development tool, never treatment (disclaimers + crisis links).

## 8. Scope & Success Metrics
- **MVP in:** web app · anonymous · 2D layered avatar · trait/emotion library w/ intensity · module packs + manifestation + free-hand · template plan engine + LLM plan-polish · Persona Chat (text, capped) · daily loop · evidence log · 30-day report · safety filter.
- **MVP out:** 3D, mobile apps, accounts/sync (localStorage + export only), community, coach marketplace, Phase-2 features.
- **Phase 2 (gated on D7 retention pass):** audio scene-partner (actor module, EN-only, capped, Pro) · 3-persona Playground (Pro).
- **Cut from roadmap:** Romantic Partner module.
- **Market:** TAM ~$8–10B · SAM ~$0.6–1B · SOM 24mo ~$1–3M ARR *(assumptions, challengeable)*.
- **Success (first 90 days):**

| Metric | Target |
|---|---|
| Visitor → persona created | ≥35% |
| Persona → first wear-session done | ≥50% |
| Persona Chat tried | ≥40% |
| D7 return (anon cookie) | ≥15% |
| D30 "then vs now" report generated | ≥8% |
| Interviews: "got a real-world result" | ≥25% of 20 |

## 9. Tech Complexity

| Capability | Complexity | Note |
|---|---|---|
| 2D layered avatar (SVG zones + chips) | Low-Med | Easy after dropping 3D |
| Trait/emotion library + packs | Low | Curated JSON |
| Template plan engine | Low | Rules + templates |
| LLM: plan polish + Persona Chat | Med | Single-call pattern, prompt scaffolds, moderation |
| Anonymous persistence | Low | localStorage + JSON export |
| Safety filter | Med | Curated library at MVP + LLM moderation on chat |
| Ph2: audio scene-partner | Med-High | Realtime STT+LLM+TTS, latency-sensitive |
| Ph2: 3-persona Playground | Med | Single "screenwriter" LLM call roleplays all 3 |

## 10. Speed & Cost
- **MVP: 4–5 weeks.** Phase-2 playground: +2–3 wks. Phase-2 audio scene-partner: +2–3 wks. Full v1 (accounts, PWA, monetize): +8–12 wks post-validation.
- **Cost (assumptions labeled):**

| Item | Build | Run/mo (MVP, <2k MAU) | Run/mo (10k MAU) |
|---|---|---|---|
| Hosting (Vercel/CF Pages free) | — | $0 | $0–20 |
| LLM (chat capped + plan polish; Haiku-class) | — | $5–25 | $100–300 |
| Backend | $0 (none at MVP) | $0 | $25 (Supabase) |
| Domain/misc | ~$20 | $2–5 | $5 |
| **MVP total** | **~$20** | **~$7–30/mo** | **~$150–350/mo** |
| Ph2 audio (per 5-min scene ≈ $0.35–0.75; capped, Pro-only) | — | usage-based, contained by caps | scales with Pro users |

- Cost levers: per-user caps, cached templates, cheap model default + premium model as paid tier, voice kill-switch flag.

## 11. Scalability
- 1k users: trivial (static + serverless). 100k: LLM/voice spend is the only scaler → caps, caching, tiering. 1M: accounts, queues, possibly small self-hosted model. Architecture horizontally scalable; **cost, not structure, is the constraint.**

## 12. Go / No-Go
**GO — 4–5 wk MVP, validation-first.** Deciding conditions:
1. 2D avatar + Persona Chat feels "magical" in week-2 internal demo.
2. ≥15% D7 return in soft launch (actor forums, r/DecidingToBeBetter, student communities).
3. Safety framing holds (non-clinical positioning respected; moderation triggers <1%).
4. **Phase-2 (audio + playground) starts only after conditions 1–2 pass.**

## 13. Implementation & Ops
```
Wk1: avatar + library + packs ─► Wk2: plan engine + daily loop ─► Wk3: Persona Chat + safety ─► Wk4: evidence log + 30-day report + polish ─► Wk5: soft launch ─► 30/90-day metric gates ─► Phase 2 (playground, then audio scene-partner) ─► Full v1 (accounts, PWA, monetize)
```
- KPIs from day 1: funnel, wear-session completion, chat usage & cost/user, moderation hits, mission completion, D7/D30.
- Ops: Sentry (free) + event log · LLM fallback model · daily caps · feature flags (chat & voice kill-switches).

## 14. ROI
- Validate for ~$50–150 cash + 5 wks time.
- Freemium → Pro $3–5/mo (unlimited personas & chat, deep-technique + manifestation library, actor exports). Phase-2 playground & audio scene-partner = natural Pro exclusives.
- 1,000 payers ≈ $4k MRR vs <$400/mo run → ~90% gross margin. Sensitivity: D7 retention >> CAC.

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Users treat app as therapy | Med | High | Non-clinical framing, disclaimers, crisis links, no clinical marketing (also regulatory shield) |
| Persona Chat over-attachment | Low-Med | Med-High | Rehearsal-mirror framing, daily caps, no companion/romantic modes |
| Harmful persona creation | Med | Med | Curated library at MVP; moderation on chat & free text |
| Manifestation reads as pseudoscience | Med | Med | Grounded framing + action bridge, no outcome promises |
| Retention flop (novelty toy) | Med-High | High | Evidence log, streaks, trait-of-week, 30-day report |
| LLM/voice cost spike | Low-Med | Med | Caps, caching, cheap default, Pro-gating voice, kill-switch |
| Playground entertainment-drift | Med | Med | Phase-gate; Pro-tier; keep tied to transformation framing |
| Ph2 audio latency/quality | Med | Med | Managed realtime stack, short turns, EN-only first |
| IP sensitivity (Dispenza/Hawkins) | Low | Med | Inspiration only; no branding/reproduction |
| Right of publicity — living/deceased celebrities *(v4)* | Med | Med-High | §4.6 tier strategy; nominative "inspired by" use; disclaimers; no images/voice; legal review before monetization |
| Character copyright/TM — movie & anime personas *(v4)* | Med-High if named | High | T3 archetype packs; protected names never shipped in content JSON; user-side renaming only |
| Defamation via AI speech (living figures) *(v4)* | Low-Med | High | Prompt guardrail: no fabricated quotes/private facts/endorsements; "unofficial practice persona" UI disclaimer |
| Positioning drift toward entertainment chat *(v4)* | Med | High | Transformation framing enforced in copy + prompts; same caps; no companion features (§3.3 shield intact) |
| Copycats | Med | Low-Med | Speed, brand, technique-library depth |

---
*Business use case:* freemium consumer web app; multi-module architecture = multiple acquisition niches on one engine; Persona Chat as MVP differentiator; audio scene-partner + Playground as Phase-2 Pro differentiators; B2B2C channel (drama schools, fitness coaches) in Full v1. Romantic/companion features intentionally excluded on uniqueness + regulatory grounds.
