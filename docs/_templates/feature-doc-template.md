<!-- Template for a single feature/tab/module doc. Copy this file, fill in the sections,
     delete this comment block. See docs/_templates/README.md for the folder-level
     conventions this pairs with. -->

# <Feature or Tab Name>

## Overview

<1-3 sentences: what this is, who uses it (role/persona, not "the user"), and what
problem it solves. If it's a tab/page, say where it lives (route/URL).>

## Access

<Who can see/use this — permission tiers, roles, auth requirements. If the UI-level
gate and the server-side (API) gate don't match, say so explicitly here — that
mismatch is exactly the kind of thing a reader can't get from skimming one file.>

## How It Works

- **UI**: `<component file path>` — <one line on what it renders/does>
- **API**: `<router/procedure file>` → `<handler file>` — <one line>
- **Data**: `<Prisma model(s) or view(s), schema.prisma line refs>` — <one line>

<Add bullets for anything a reader would be surprised by: client-side vs.
server-side filtering, caching/staleness, background jobs, derived/computed
fields, raw SQL instead of the ORM, etc.>

## How to Use It

<Written for the person using the feature, not the code. Step-by-step or bulleted:
what can you search/filter/sort by, what does each button/badge/status mean, what
happens when you click X.>

## Known Issues / Gotchas

<Bulleted. Permission mismatches, TODOs, rough edges, non-obvious constraints.
Omit this section entirely if there's genuinely nothing here — don't write "N/A".>

## Related Files

| Path              | Purpose |
| ----------------- | ------- |
| `path/to/file.ts` | ...     |

---

_Last verified against code: <YYYY-MM-DD>. If you change any file listed above,
update this doc in the same PR and bump this date._
