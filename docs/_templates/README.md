# Documentation Conventions

This describes the structure new `docs/<Area>/` folders should follow. Applied first to
`docs/DataPortal/` as the reference example.

## Folder structure

```
docs/<Area>/
├── README.md               # Overview + index. Entry point — start here.
├── <SubUnit>/
│   └── README.md           # One folder per tab/page/module within the area.
├── <SubUnit>/
│   ├── README.md           # A sub-unit's folder can hold more than just its
│   └── <supporting>.md     # main doc — e.g. a deep per-item reference the
│                           # main doc links out to instead of inlining.
└── implementation-notes/   # Optional: point-in-time plans/walkthroughs from when
    └── ...                 # a feature was built. Historical, not kept current —
                             # see "Reference docs vs. implementation notes" below.
```

- **`README.md`** is the only required file, at both the area level and inside each
  sub-unit folder. The area-level one stays high-level: what the area is, who uses
  it, an index linking to each sub-unit's `README.md`, and a pointer to any
  cross-cutting docs it depends on (e.g., access control, database).
- **One folder per sub-unit** (tab, page, major component), named after the thing
  itself (`Organizations/`, not `organizations-tab-notes/`), so the mapping from UI
  to doc is obvious. Using a folder rather than a flat `<SubUnit>.md` leaves room for
  supporting files (e.g. a per-report SQL reference) to live next to the main doc
  without cluttering the area root.
- Use `docs/_templates/feature-doc-template.md` as the starting point for each
  sub-unit's `README.md`. It's opinionated on purpose — the same section order
  across every doc means a reader (or an LLM asked to update one) always knows
  where to look.

## Reference docs vs. implementation notes

Keep these separate — they rot differently:

- **Reference docs** (`README.md`, `<SubUnit>.md`) describe the feature _as it is
  today_. They should always be current. This is the "how does this work / how do I
  use it" material.
- **Implementation notes** (`implementation-notes/*.md`) are a snapshot of a plan or
  a "what changed" writeup from when a feature was built. They're allowed to go
  stale — they're historical record, not a living doc. Don't mix the two in the same
  file, and don't feel obligated to keep an implementation note updated after the
  fact — supersede it with the reference doc instead.

## Keeping docs from going stale

Docs rot because nothing forces them to change when the code does. Cheapest to
most automated:

1. **Anchor every doc to real files.** The `Related Files` table at the bottom of
   each sub-unit doc plus the `Last verified against code: <date>` stamp exist so
   staleness is mechanically detectable later, not just "does this feel out of
   date."
2. **PR checklist item**: "Does this change affect a documented feature under
   `docs/`? Update it in the same PR." Cheapest possible enforcement, no tooling
   required — add it to the PR template.
3. **A drift-check CI job** (not yet built): a script that reads each doc's
   `Related Files` table and the `Last verified` date, checks `git log` on those
   paths since that date, and comments on the PR ("this doc might be stale") when
   they've changed. Warn-only — never block a merge over documentation.
4. **An LLM-assisted update pass** (not yet built): a slash command (e.g.
   `/update-docs docs/<Area>`) that hands a code diff plus the current doc to
   Claude and asks it to draft the updated sections, for a human to review before
   committing. This is the actual "auto-update" — the CI job in #3 can only ever
   flag staleness, not correctly rewrite prose.
5. **Scheduled audit** (optional, once there are many areas): a periodic job that
   re-derives each doc from the current code and diffs it against what's committed,
   surfacing drift across the whole `docs/` tree instead of per-PR.

Start with #1 and #2 — they cost nothing. Add #3 once staleness actually becomes a
recurring problem, not preemptively.
