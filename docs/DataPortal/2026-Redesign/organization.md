# Organization Table / Suggest / Add — Phase B Feature List

Working list of desired features for the Organization table, suggesting an org, and adding an org. Not scoped/designed yet — filtering logic and other implementation details deferred.

## Sizing (quick top-down view)

| Item                                                           | Size                           | Why                                                                                                                                                                                                                                      |
| -------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add org (single)                                               | Small                          | `createNewQuick` mutation and `generateSlug` query already exist; only needs one new Source seed row + a modal reusing existing Suggest-org form components. No schema change.                                                           |
| Show suggested orgs (minimal filter)                           | Small                          | Extend `forOrganizationTable`'s select/where to expose `source`, add one toolbar toggle (existing pattern). No schema change.                                                                                                            |
| Unpublished status — Option A (reuse `InternalNote`)           | Small                          | Plumbing (`internalNote.create`/`getAllForRecord`) already exists and is already wired to orgs. No migration, but "current status" is inferred from note text rather than a real column — see Unpublished status section for trade-offs. |
| Suggested Organizations queue (full field spec)                | Medium                         | Needs pulling structured fields out of `Suggestion.data` JSON, joining suggester email via `User`, surfacing "processed" — real new query/UI work beyond a simple filter.                                                                |
| Unpublished status — Option B (new column)                     | Medium                         | Smallest realistic migration (one nullable column) + required-dropdown UI + table filtering wiring. Value list still pending sign-off.                                                                                                   |
| Duplicate a service (clone)                                    | Medium                         | Similar shape to existing create flows, but `OrgService` fans out to multiple related records — complexity depends on how much of that fan-out needs copying.                                                                            |
| Bulk add                                                       | Folded into "Add org (single)" | "Save & New" (loop the single-create form) covers the realistic case with no new infrastructure. A true spreadsheet/paste-grid or CSV import would be Big, and is deferred unless a real large-batch scenario shows up.                  |
| Suggest-org: submit-with-a-note despite a match                | Medium                         | Real behavior change to public-facing code — replaces a hard block with a new path, plus a decision on where the note lands.                                                                                                             |
| Resurrect `existingOrgId` as a real "suggest an addition" flow | Medium                         | Backend mostly exists, just unwired — but doing it properly means adding a review/moderation gate that doesn't exist today.                                                                                                              |
| Find duplicate/near-dup orgs + "combine"                       | Big                            | "Find" alone could reuse existing trigram infra (Medium on its own); "combine" is a new capability — reassigning related records across tables, picking a winner, resolving conflicts.                                                   |
| Vetting questionnaire integration                              | Big                            | Still unscoped — no schema for storing responses, no defined workflow, likely depends on the not-yet-built org-assignment/workflow feature.                                                                                              |
| Saved Views                                                    | Big                            | Fully designed already, but cross-cutting — new schema for per-user per-table views, UI on every Data Portal table.                                                                                                                      |
| Teams & Tasks                                                  | Big (deferred)                 | Explicitly out of scope for now.                                                                                                                                                                                                         |

## Organization table

- Find duplicate/near-duplicate orgs across the whole table (not just at suggestion-submit time) so they can be reviewed and combined/published/deleted — "combine" is a new capability, not yet built anywhere

## Suggested Organizations queue

Add a "Suggested Organizations" queue to the logged-in Data Portal view, showing:

- Organization name that was suggested
- Date suggested
- Organization website
- Country of organization
- Any "Additional Information" that was suggested (*currently not visible anywhere in the Data Portal)
- Organization address
- "What type(s) of service(s) does this organization provide?"
- "Does this organization provide service(s) focused on specific LGBTQ+ communities?"
- Affiliated email of the user who suggested it
- Whether it's been processed yet by InReach's Resource Team

Ideal (stretch): the suggester's email gets a notification when the org is published.

Note: everything above except "processed" already exists in `Suggestion.data` (the raw submitted payload) or on the linked `User` — it's just not surfaced in the Data Portal today. "Processed" maps to the existing-but-unused `Suggestion.handled` field.

## Add an org

- Single add: popup reusing the Suggest-an-Org form UI — needs the `createNewQuick` adapter (slug generation + its own distinct `Source` so staff-added orgs don't get mixed into the public-suggestions view)
- Open: do staff-added orgs (single or bulk) need to go through the same publish-gate/review as public suggestions, or can staff self-publish immediately?

**Buttons (three across the bottom of the modal):**

- **Save** — `carbon:save` icon. Creates the org, closes the modal.
- **Save & Edit** — `carbon:edit` icon (same pencil icon already used elsewhere in the app for "edit an org," kept consistent rather than introducing a new visual for the same concept). Creates the org, navigates to the org edit page.
- **Save & New** — `carbon:add` icon. Creates the org, confirms it was created, reopens the same blank form for another entry. This is the established label for this exact pattern (Salesforce/Zendesk use it verbatim).

Verified all three icon names exist in this repo's Carbon icon set (`@iconify-json/carbon`).

**Why "Save," not "Create" or "Submit":** "Create" is the most literally precise word, but "Save" composes more naturally in the compound labels ("Save & New" reads cleanly; "Create & New" sounds redundant). "Submit" is deliberately avoided — that word is already doing real semantic work on the public Suggest-an-Org form, where it correctly signals "this goes to review." Reusing it here would blur the Suggest (public, always reviewed) vs. Add (staff, may not need review — see open question above) distinction.

**On bulk add — reframed:** "Save & New" (loop the same single-create form, reset and reopen after each save) effectively _is_ a lightweight bulk-add path — each entry still gets full validation and the real per-item dup-check (`getPotentialMatches`), one at a time, with no new grid/import infrastructure needed. This is the recommended default for "staff adding a handful of orgs they've individually identified." A true spreadsheet/paste-grid or CSV import is a materially bigger, separate build (needs a real data-grid library or column-mapping/import UI) and is only worth it if the real trigger is "someone hands us a list of 50+ orgs to onboard at once" — not yet confirmed as a real scenario, so deferred unless it comes up.

## Suggest an org (public form) — duplicate handling

- Confirmed: the existing dup-check already includes unpublished _and_ soft-deleted orgs in its matching pool — a rejected or still-pending org permanently blocks resubmission of the same org/website. Working as intended.
- New idea: instead of a hard block on a match, let the submitter push through anyway with a note ("this is a really good resource...") — needs design: does that attach as a comment on the existing org, or does it still need staff eyes as a distinct entry?
- Dormant capability found: the backend already supports attaching new info to an _existing_ org (`existingOrgId`) but nothing in the current UI wires it up — could be deliberately resurrected as its own "suggest an addition to an existing org" flow if useful, separate from the note-on-submit idea above

**Button copy update:** change the submit button from its current text, "Submit new organization," to **"Submit for review"** — makes the review-implication visible on the button itself (today it only lives in smaller helper text below: _"All suggested organizations are subject to review by InReach before publication."_) and makes the contrast with the internal Save/Save & Edit/Save & New buttons unmistakable. Process note: this is a public, multi-locale string (Crowdin-managed, ~20+ locale files) — the English source (`apps/app/public/locales/en/suggestOrg.json`, key `form.btn-submit`) updates and syncs through the normal Crowdin flow, unlike the Data Portal's English-only internal strings.

## Vetting

- Integrate the actual vetting questionnaire (from the original Vetting Assignment Sheet / Workflow PDF) into the Data Portal, so vetting happens in-app rather than in the external process

## Services

- "Duplicate a service" — clone an existing service so staff only need to tweak contact/location details instead of re-entering everything

## Unpublished status

Replace/augment the plain `published` boolean with a status field capturing _why_ something is unpublished, not just that it is. Details from the data manager:

**Purpose (two, overlapping):**

1. Workflow tracking — visibility into what orgs are being worked on and how far along an intern/volunteer is.
2. A durable record for orgs that are unpublished because they _can't_ be verified (failed vetting, inactive, unaffirming). Today these get soft-deleted just to clear them out of the active workflow view — but once hard-delete exists, that approach loses the record entirely, both for institutional memory and to keep the org from being suggested again (the duplicate-check depends on the org's rows still existing in the DB — see Suggest an org section above).

**Scope:** Organizations only (not services/locations).

**Field shape:** Single-select dropdown, required. Not multi-select — an org has exactly one status at a time.

**Default:** Newly-suggested orgs get "New" automatically.

**Who can set it:** Anyone with basic Data Portal permissions (i.e., anyone who can already edit/publish orgs) — no extra permission gate.

**Status values (first pass — data manager wants to run this by Abby Davies before finalizing):**

- New — default for newly-suggested orgs
- In progress — intern/volunteer actively working the entry
- Waiting to hear back — blocked pending a response from the org
- Inactive — terminal
- Unaffirming — terminal

Note: Inactive/Unaffirming are end states, not workflow steps — "resolving" them isn't the goal, marking them _is_ the resolution. So this is deliberately not a ticket-status-style vocabulary (open/in review/done), since two of the five values represent a final, permanent classification rather than a step in a process.

**Change history:** No bespoke history feature needed — the existing generic audit trail plus the future org-assignment/workflow feature should cover it.

**Backfill for existing unpublished orgs:** Leave empty rather than spend time retroactively classifying the backlog — likely add a placeholder value like "Undetermined" or a dated tag (e.g. "Pre-[date]") to distinguish pre-feature orgs from anything left unset going forward, rather than leaving them ambiguous.

**Implementation approach — two options, not yet decided:**

- **Option A — reuse the existing `InternalNote` model (no migration).** `InternalNote` already has a nullable `organizationId` FK, and the query/mutation plumbing (`internalNote.getAllForRecord`, `internalNote.create`) is already built and already wired up for orgs via `InternalNotesDrawer.tsx`. The status dropdown would just create a note with a canonical text value; "current status" = the most recent matching note. Cheap to build. Trade-offs: `InternalNote` is an append-only log also used for genuine freeform staff commentary, so "current status" has to be inferred by filtering/sorting text rather than read off a column — no DB-level guarantee it's ever set (in tension with "required"), risk of a real freeform note accidentally string-matching a status label, and filtering the Organizations table by status means a join + text match instead of a simple indexed column check.
- **Option B — one new nullable column on `Organization`** (e.g. an enum), the smallest realistic migration. Actually enforceable as required, actually indexable/filterable the same way `published`/`deleted` already are, no ambiguity with freeform notes. Costs one migration.

Given the data manager's stated use case (assigning orgs to interns _based on_ status — a filtering/querying workload), Option B's structured column pays for itself quickly; Option A is the faster path if the near-term goal is just letting staff record why an org's unpublished without heavy filtering on it yet.

## Previously discussed, not yet built

- Saved Views (save/star a table view per user, mark one default, silent un-star) — fully designed earlier, applies to the Organization table among others

## Explicitly out of scope right now

- Teams & Tasks
