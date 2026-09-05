# Organization Table / Suggest / Add — Phase B Feature List

Working list of desired features for the Organization table, suggesting an org, and adding an org. Not scoped/designed yet — filtering logic and other implementation details deferred.

## Sizing (quick top-down view)

| Item                                                           | Size                           | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add org (single) — **Done**                                    | Small                          | Shipped as `AddOrgModal`. See [`Organizations/README.md`](../Organizations/README.md#how-to-use-it).                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Show suggested orgs (minimal filter) — **Done**                | Small                          | Shipped as the "Create Method" toolbar dropdown (Public / Internal / All). Needed more than raw `source`: a new `creatorHadDpAccess` snapshot column, since `source === 'suggestion'` alone can't tell a genuine public submission from staff/volunteers using the same public form. See [`docs/Database/organization_creator_had_dp_access.md`](../../Database/organization_creator_had_dp_access.md).                                                                                                                       |
| Suggested Organizations queue (full field spec)                | Medium                         | Needs pulling structured fields out of `Suggestion.data` JSON, joining suggester email via `User`, surfacing "processed" — real new query/UI work beyond a simple filter.                                                                                                                                                                                                                                                                                                                                                     |
| Unpublished status (new column) — **Done**                     | Medium                         | Shipped as the toolbar's "Status" `MultiSelect` (All/Published/reason values) plus a row-level "Set status" popover — six reason values live (`NEW`/`IN_PROGRESS`/`WAITING`/`INACTIVE`/`UNAFFIRMING`/`UNRESPONSIVE`). Backfill for pre-existing unpublished orgs shipped too, as a manual triage dashboard rather than an automated migration. See [`Organizations/README.md`](../Organizations/README.md#how-to-use-it) and [`docs/Dashboards/UnpublishedStatus/README.md`](../../Dashboards/UnpublishedStatus/README.md).   |
| Duplicate a service (clone) — **Done**                         | Medium                         | Similar shape to existing create flows, but `OrgService` fans out to multiple related records — complexity depended on how much of that fan-out needed copying. See [`Organizations/duplicate-service.md`](../Organizations/duplicate-service.md).                                                                                                                                                                                                                                                                            |
| Bulk add                                                       | Folded into "Add org (single)" | "Save & New" (loop the single-create form) covers the realistic case with no new infrastructure. A true spreadsheet/paste-grid or CSV import would be Big, and is deferred unless a real large-batch scenario shows up.                                                                                                                                                                                                                                                                                                       |
| Suggest-org: submit-with-a-note despite a match                | Medium                         | Real behavior change to public-facing code — replaces a hard block with a new path, plus a decision on where the note lands.                                                                                                                                                                                                                                                                                                                                                                                                  |
| Resurrect `existingOrgId` as a real "suggest an addition" flow | Medium                         | Backend mostly exists, just unwired — but doing it properly means adding a review/moderation gate that doesn't exist today.                                                                                                                                                                                                                                                                                                                                                                                                   |
| Find duplicate/near-dup orgs + "combine"                       | Big                            | "Find" alone could reuse existing trigram infra (Medium on its own); "combine" is a new capability — reassigning related records across tables, picking a winner, resolving conflicts.                                                                                                                                                                                                                                                                                                                                        |
| Saved Views                                                    | Big                            | Fully designed already, but cross-cutting — new schema for per-user per-table views, UI on every Data Portal table.                                                                                                                                                                                                                                                                                                                                                                                                           |
| Bulk Search & Replace — **Done**                               | Big                            | Shipped as its own `dataPortalManager`+ side-nav page — six-field keyword search (org/service name/description/attributes/tags), inline edit, checkbox-reviewed find & replace, and bulk attribute/tag add-remove. Needed genuinely new search indexing (a trigram index on description content, materialized `OrgService.attributeIds`/`.tagIds`) — the one part of this that was actually new infrastructure, not just new plumbing. See [`Organizations/bulk-search-replace.md`](../Organizations/bulk-search-replace.md). |
| Teams & Tasks                                                  | Big (deferred)                 | Explicitly out of scope for now.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

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

## Add an org — Done

`AddOrgModal` — reuses the Suggest-an-Org form UI via the `createNewQuick` adapter, with three save
behaviors (Save / Save & Edit / Save & New, the last also serving as the supported "bulk add" path).
See [`Organizations/README.md`](../Organizations/README.md#how-to-use-it) for current-state detail,
button icons, and naming rationale.

## Suggest an org (public form) — duplicate handling

- Confirmed: the existing dup-check already includes unpublished _and_ soft-deleted orgs in its matching pool — a rejected or still-pending org permanently blocks resubmission of the same org/website. Working as intended.
- New idea: instead of a hard block on a match, let the submitter push through anyway with a note ("this is a really good resource...") — needs design: does that attach as a comment on the existing org, or does it still need staff eyes as a distinct entry?
- Dormant capability found: the backend already supports attaching new info to an _existing_ org (`existingOrgId`) but nothing in the current UI wires it up — could be deliberately resurrected as its own "suggest an addition to an existing org" flow if useful, separate from the note-on-submit idea above

**Button copy update:** change the submit button from its current text, "Submit new organization," to **"Submit for review"** — makes the review-implication visible on the button itself (today it only lives in smaller helper text below: _"All suggested organizations are subject to review by InReach before publication."_) and makes the contrast with the internal Save/Save & Edit/Save & New buttons unmistakable. Process note: this is a public, multi-locale string (Crowdin-managed, ~20+ locale files) — the English source (`apps/app/public/locales/en/suggestOrg.json`, key `form.btn-submit`) updates and syncs through the normal Crowdin flow, unlike the Data Portal's English-only internal strings.

## Services

- "Duplicate a service" — **Done.** Clone an existing service so staff only need to tweak
  contact/location details instead of re-entering everything. See
  [`Organizations/duplicate-service.md`](../Organizations/duplicate-service.md).

## Bulk Search & Replace

**Done.** Search across organization and service names, descriptions, and attributes by keyword and/or
attribute filter, then review/edit matches (org as parent row, services as sub-rows) without opening
each record individually — for surfacing things like outdated (e.g. COVID-era) text, or content that
needs sensitive population-language review. Gated `dataPortalManager`+, shipped as a new side-nav
page rather than a mode of the existing Organization table. Both inline edit and checkbox-reviewed
bulk operations (find & replace, and bulk attribute/tag add-remove) shipped in this first version, not
staged into a later phase. Full implementation detail, known gaps, and test coverage now live in
[`Organizations/bulk-search-replace.md`](../Organizations/bulk-search-replace.md).

## Unpublished status

Replace/augment the plain `published` boolean with a status field capturing _why_ something is unpublished, not just that it is. **Shipped** — a native `OrgUnpublishedReason` enum column, the Organizations table's "Status" filter, the row-level "Set status" popover, and a manual backfill triage dashboard for pre-existing unpublished orgs are all live; see [`Organizations/README.md`](../Organizations/README.md#how-to-use-it) and [`docs/Dashboards/UnpublishedStatus/README.md`](../../Dashboards/UnpublishedStatus/README.md).

## Previously discussed, not yet built

- Saved Views (save/star a table view per user, mark one default, silent un-star) — fully designed earlier, applies to the Organization table among others

## Explicitly out of scope right now

- Teams & Tasks
