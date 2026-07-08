# ADR-001 — Celebrity & fictional-character persona naming (IP strategy)

*Status: **ACCEPTED** · Date: 2026-07-08 · Decision owner: product owner · Supersedes: none*
*Context docs: BRD v4 §4.6 (legal background) · PRD Part C (module spec)*

## Context

The Module Expansion (Celebrity Icons, Mimicry, Movie/TV, Anime) trades on recognizable
figures. Two legal regimes apply: **right of publicity / personality rights** for real
people (actively enforced in India — Anil Kapoor Delhi HC 2023 explicitly covering AI,
Bachchan 2022; US state statutes; estates like Ali/Bruce Lee/Kobe are commercial
operators with retained counsel — see George Carlin estate v. Dudesy 2024), and
**copyright + trademark** for fictional characters (well-delineated character doctrine;
Disney/WB/Toei run automated DMCA enforcement that targets the HOST, not us — a
takedown to Vercel can suspend the whole deployment without a court).

Core insight: the app's own thesis is the legal moat. Character.AI's product is
*impersonation* ("chat with Ronaldo"); ours is *becoming* ("wear Ronaldo's mindset").
Facts, ideas, and qualities are not ownable; identity is.

## Options considered

1. **Raw real names everywhere + rename later if trouble** — REJECTED. The fallback is
   cosmetic ("Ronaldo's Spirit Animal" still uses the name — exposure unchanged); tiny
   authenticity gain over attribute-naming; for fictional names the complaint arrives as
   a host-level DMCA, where "rename later" can't outrun a suspended deployment.
2. **"Vibe/Energy" attribute names for everyone incl. fictional ("Iron Man Vibe")** —
   PARTIALLY ADOPTED. For real people, "Kobe's Energy" is the same legal family as
   "Kobe Mindset" (descriptive attribute naming) — adopted as a flavor. For fictional,
   REJECTED: no suffix launders a trademark; the crawler greps "Iron Man" regardless.
3. **Remove celebrity chat, keep persona wearing** — REJECTED. Misdiagnosis: the pack
   name is the primary exposure, chat only the impersonation/defamation slice (~1/3).
   Kills the module's most engaging feature + an MVP KPI (≥40% try chat) for partial relief.
4. **Attribute-naming family + structural protections (merged plan)** — **ACCEPTED.**

## Decision

**Real people — attribute-title family, real names kept:**
- Title formats (flavor per pack, all descriptive-of-qualities): "[X] Mindset" ·
  "[X]'s Energy" · "The [X] Blueprint" · "[X]'s Spirit". NEVER a pack titled as the
  bare person ("Cristiano Ronaldo"), never "Twin"/duplicate framing (walks back toward
  impersonation).
- No likeness assets ever: no photos, no audio voice, no trademarked marks (CR7,
  Jumpman, "jhakaas" — that catchphrase was litigated).
- Packs contain only publicly documented qualities; identity scripts written by us; no
  real quotes.
- Chat: persona speaks first-person with the figure's characteristic energy but
  identifies as "your [X] Mindset", never claims to BE the person, never fabricates
  quotes/private facts; public career facts OK. UI shows one-line disclaimer:
  "Unofficial practice persona — not affiliated with or endorsed by [X]."
- Tiering still applies: T0 public-domain/mythological/historical = real names, no
  restrictions (Musashi, Tesla, Bheema, Arjuna, Sherlock Holmes — PD since 2023).
  T1 deceased-with-estates and T2 living = attribute titles + disclaimer + guardrails.

**Fictional characters — archetype-shipped, user-named:**
- Shipped content (bundled into public JS — nothing in src/content is private) contains
  NO protected character names/marks/catchphrases. Pack IDs are archetype slugs
  (pack-genius-inventor), titles are archetypes ("The Genius Inventor").
- **"Inspired by" field**: at persona creation the user may type who inspires them
  ("Tony Stark") — stored in THEIR localStorage, displayed in THEIR UI, passed to chat
  as user-provided context. User content ≠ our published content (the Character.AI
  UGC posture applied where it works). In-app authenticity ≈ full; crawlers find nothing.
- Human reference mapping archetype ↔ inspiration lives in docs/content-roster.md
  (repo docs are not bundled into the app).

**Dynamic controls (switch-off must be easy):**
- Per-pack `active` flag in content JSON — flip false + redeploy = pack gone same day.
- Per-module `enabled` flag in MODULES metadata — hides a whole module from Home/routes.
- All naming lives in content JSON, never in code logic — rename = JSON edit.
- Comply-fast SOP: any C&D → rename/deactivate that one pack, redeploy same day. One
  letter costs one pack, never the product.

**Exclusions & flags:**
- Gandhi: excluded by statute (Emblems & Names Act 1950, India).
- Shivaji, Bhagat Singh: not in seed roster (politically sensitive in India; may add
  later with copy review).
- Mythological figures (Bheema, Arjuna): respectful non-worship framing.
- Marlon Brando: reclassified from Movie module to Icons T1 (real person).
- No AI voice cloning anywhere (ELVIS-Act class laws + Phase-2 cost).

## Consequences

- ~95% of the authenticity with capped downside; catastrophic vector (host-level DMCA)
  closed; celebrity exposure reduced to a survivable letter-per-pack worst case.
- Residual risk honestly stated: attribute-naming with real names is NOT zero-risk; a
  determined counsel could still send a C&D. Mitigation = SOP + no-likeness + disclaimers.
- **Formal legal review required before monetization** — commercial use strengthens
  publicity claims; revisit this ADR then (that review may upgrade or relax tiers).

## Revisit triggers

Monetization/Pro launch · first C&D received · NO FAKES Act (US) passes · India
personality-rights statute changes · a pack's figure becomes controversial (morals
clause: deactivate via `active` flag).
