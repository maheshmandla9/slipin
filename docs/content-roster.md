# Content roster — pack ↔ inspiration mapping (internal reference)

*This file lives in `docs/` and is **never bundled into the app** — the shipped JS bundle
must not contain protected fictional-character names (ADR-001). This is where humans look
up "which archetype is which character." Update it whenever packs are added/renamed/deactivated.*

## How to kill a pack (comply-fast SOP)
Set `"active": false` on the pack in `src/content/packs.json` → commit → redeploy. Gone from
every surface same day. To hide a whole module: `enabled: false` on its entry in
`src/content/index.ts` MODULES.

## Icons module (real people — names shipped, attribute titles per ADR-001)
| Pack id | Title | Figure | Status / tier |
|---|---|---|---|
| pack-icon-ronaldo | Ronaldo Mindset | Cristiano Ronaldo | living (T2) |
| pack-icon-kobe | Kobe's Energy | Kobe Bryant | deceased (T1) |
| pack-icon-ali | The Greatest — Ali's Spirit | Muhammad Ali | deceased (T1) |
| pack-icon-bruce-lee | The Bruce Lee Blueprint | Bruce Lee | deceased (T1 — estate litigious) |
| pack-icon-kalam | Kalam Mindset | A.P.J. Abdul Kalam | deceased (T1) |
| pack-icon-musashi | Miyamoto Musashi | Miyamoto Musashi | public domain (T0) |
| pack-icon-srk | SRK's Energy | Shah Rukh Khan | living (T2) |
| pack-icon-kohli | Kohli's Fire | Virat Kohli | living (T2) |
| pack-icon-arjuna | Arjuna's Focus | Arjuna (Mahabharata) | public domain (T0 — religious-sensitivity: respectful, non-worship framing) |
| pack-icon-einstein | Einstein Mindset | Albert Einstein | public domain (T0 — US publicity expired; avoid trademark-styled branding) |

## Screen module (fictional — archetype-shipped; the character name below NEVER ships)
| Pack id | Shipped title | Inspiration (internal only) |
|---|---|---|
| pack-screen-genius-inventor | The Genius Inventor | Tony Stark / Iron Man (Marvel) |
| pack-screen-night-vigilante | The Night Vigilante | Batman (DC) |
| pack-screen-underdog-champion | The Underdog Champion | Rocky Balboa |
| pack-screen-free-spirit | The Free Spirit | Geet (Jab We Met) |
| pack-screen-unstoppable-professional | The Unstoppable Professional | John Wick |
| pack-screen-sherlock | Sherlock Holmes | Sherlock Holmes — **real name OK, public domain since 2023** |

## Anime module (fictional — archetype-shipped)
| Pack id | Shipped title | Inspiration (internal only) |
|---|---|---|
| pack-anime-shonen-spirit | The Shonen Spirit | Goku (Dragon Ball) / Naruto Uzumaki |
| pack-anime-silent-blade | The Silent Blade | Levi Ackerman (Attack on Titan) |
| pack-anime-relentless-fighter | The Relentless Fighter | Baki Hanma |
| pack-anime-gentle-guardian | The Gentle Guardian | Tanjiro Kamado (Demon Slayer) |

## Mimicry module (skill packs — no figure content shipped; study subject is user-chosen)
| Pack id | Title |
|---|---|
| pack-mimic-eye | The Mimic's Eye |
| pack-mimic-impressionist | The Impressionist |

## Dropped / deferred (owner informed 2026-07-08)
- **Mahatma Gandhi** — excluded by statute (Emblems & Names Act 1950, India).
- **Shivaji, Bhagat Singh** — deferred (politically sensitive in India); may add later with copy review.
- **Marlon Brando** — reclassified: real person → belongs in Icons (T1) if added, not Screen.
- Friends cast, other Marvel characters, Crime Master Gogo, Chaplin's Tramp — candidates for
  future archetype packs (ensemble-loyalty, comic-chaos, silent-resilience); not in seed.

## Requested personas
User demand arrives as PostHog `persona_requested` events (text + module). Check that
dashboard before each content expansion; rank by frequency.
