# Organization Unpublished Status

Design notes for a new "why is this unpublished" status field on Organizations, gathered from the data
manager. Not yet implemented — this doc replaces the shorter "Unpublished status" section previously in
[`organization.md`](./organization.md).

## Purpose (two, overlapping)

1. **Workflow tracking** — visibility into what orgs are being worked on and how far along an
   intern/volunteer is.
2. **A durable record for orgs that can't be verified** (failed vetting, inactive, unaffirming). Today
   these get soft-deleted just to clear them out of the active workflow view (orgs are assigned to
   interns based on what's unpublished-and-never-verified, which today also catches orgs that simply
   failed vetting). Once hard-delete exists, that workaround loses the record entirely — both for
   institutional memory and to keep the org from being suggested again (the duplicate-check depends on
   the org's rows still existing in the DB — see the "Suggest an org" section in
   [`organization.md`](./organization.md)).

## Decisions

| Question                                                     | Decision                                                                                                                                                    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope — Orgs, Locations, or any Published/Unpublished data?  | **Organizations only.**                                                                                                                                     |
| Free text or dropdown?                                       | **Dropdown**, of hardcoded values (see below).                                                                                                              |
| One reason or multiple?                                      | **One** — single-select, not multi. An org has exactly one status at a time.                                                                                |
| Required or optional when unpublishing?                      | **Required.**                                                                                                                                               |
| Default value                                                | **"New"** — newly-suggested orgs get this automatically.                                                                                                    |
| Who can set/clear it?                                        | **Anyone with basic Data Portal permissions** (i.e. anyone who can already edit/publish orgs) — no extra permission gate beyond that.                       |
| Searchable / reportable?                                     | **Yes** — needs to support filtering and reporting, not just display.                                                                                       |
| Per-reason "who/when" history?                               | **No bespoke history feature.** The existing generic `AuditTrail` on `Organization`, plus the not-yet-built org-assignment/workflow feature, is sufficient. |
| Assignment tracking (is someone "on the hook" for a status)? | Purely a status label — assignment, if it exists, is tracked by the separate (not-yet-built) org-assignment/workflow feature, not by this field itself.     |

## Status values (first pass — pending sign-off from Abby Davies)

- **New** — default for newly-suggested orgs
- **In progress** — intern/volunteer actively working the entry
- **Waiting to hear back** — blocked pending a response from the org
- **Inactive** — terminal
- **Unaffirming** — terminal

**Deliberately not ticket-status vocabulary** (open/in review/done): two of the five values
(Inactive, Unaffirming) are permanent classifications, not workflow steps — "resolving" them isn't the
goal, marking them _is_ the resolution. A ticket-style vocabulary only fits the workflow-tracking half of
this feature's purpose, not the durable-record half.

## Reporting

Since this is single-select, a report row is unambiguous — one row per org, one status value, no
comma-joining or one-row-per-(org, reason) question to resolve (that question only matters for a
multi-select field, which this explicitly isn't).

**The existing "Publish Status" filter becomes "Status," and absorbs the reason values** — not a second,
separate filter alongside it. Instead of All/Published/Unpublished, the Organizations table's toolbar
dropdown becomes All/Published/New/In progress/Waiting to hear back/Inactive/Unaffirming. This is a
strict superset of what "Publish Status" already did (unpublished collapses into "any of the five reason
values," so nothing is lost), and it directly satisfies the data manager's "yes" on filtering — there's
now one place, not two, to answer "what's this org's status."

**Same merge on the Downloads tab.** The existing Published/Unpublished List CSV reports get their
existing published-or-not column upgraded to carry the same unified Status value, rather than adding a
separate new reason column alongside it — pull the new values into the column that already exists,
don't create a parallel one.

## Where the reason gets set

Two surfaces, deliberately asymmetric — not just the Organizations table.

**1. Organizations table (primary triage surface).** A new row action opens a small anchored popover
(same shape as the existing Data Portal access control on the Users table — not a modal, not a
navigation) listing the reason values. Picking one commits immediately. On an already-published row,
picking a reason _is_ the unpublish action — it sets `published: false` and the reason together, in one
click, without leaving the table. The popover stays open afterward with an optional note field (see
below); it cannot be used to re-publish (see #2).

**2. The org's own edit page — `Navbar.tsx`'s Edit Mode Bar.** This already has a Publish/Unpublish
toggle (`handlePublishToggle`, calling `component.EditModeBarPublish`) that fires instantly today with
nothing captured, for `Organization`, `OrgLocation`, and `OrgService` alike. That toggle needs to become
asymmetric:

- **Publish** stays exactly as it is today — instant, no reason, no prompt. Publishing has a real public
  consequence (the org becomes searchable again — confirmed `published = true AND deleted = false` is
  the sole gate in both `query.searchName.handler.ts` and `query.searchDistance.handler.ts`), so it's
  deliberately kept as a considered action taken from the page where the content was just reviewed, not
  offered as a one-click table row action (see #1's restriction).
- **Unpublish**, for an `Organization` specifically, needs to open the same reason popover from #1
  instead of firing immediately. `OrgLocation`/`OrgService` pages keep today's instant-toggle behavior
  unchanged — this field doesn't apply to them.
- Backend implication: `packages/api/router/component/mutation.EditModeBarPublish.schema.ts`/`.handler.ts`
  currently does a plain `{ published }` update. It needs a reason parameter, required only on the
  `Organization` branch when `published` is going to `false`.

**Optional note, either surface.** Beneath the reason list, an optional textarea lets the person add
context (e.g. "followed up by email on 8/28"). Never required. Reuses an existing pattern rather than a
new mechanism: `packages/api/router/report/mutation.update.handler.ts` already wraps a structured field
update and an `InternalNote` creation in one transaction, using the user's text if given or
auto-generating a fallback like `"Status updated to Waiting to hear back"` if left blank — so there's
always a readable breadcrumb in the existing Internal Notes drawer, satisfying the "generic audit trail
is enough" answer even better than a bare `AuditTrail` diff would.

## Historical backfill

Existing unpublished-and-not-deleted orgs predate this field. Leaning toward **leaving them empty**
rather than spending staff time retroactively classifying the backlog — but flagged as not clearly the
best use of time either way, so a placeholder value (e.g. **"Undetermined"**, or a dated tag like
**"Pre-[date]"**) to at least distinguish pre-feature orgs from anything left unset going forward is also
on the table. **Not decided** — needs a follow-up call before implementation.

## Implementation approach

- **Option A — reuse the existing `InternalNote` model (no migration).** `InternalNote` already has a
  nullable `organizationId` FK, and the query/mutation plumbing (`internalNote.getAllForRecord`,
  `internalNote.create`) is already built and wired up for orgs via `InternalNotesDrawer.tsx`. The status
  dropdown would create a note with a canonical text value; "current status" = the most recent matching
  note. Cheap to build. Trade-offs: `InternalNote` is an append-only log also used for genuine freeform
  staff commentary, so "current status" has to be inferred by filtering/sorting text rather than read off
  a column — no DB-level guarantee it's ever set (in tension with "required"), risk of a real freeform
  note accidentally string-matching a status label, and filtering/reporting on status means a join + text
  match instead of a simple indexed column check.
- **Option B — one new nullable column on `Organization`** (an enum), the smallest realistic migration.
  Actually enforceable as required, actually indexable/filterable the same way `published`/`deleted`
  already are, no ambiguity with freeform notes.
- **Option C — a lookup table** (a new `OrgUnpublishedReason` model, `Organization.unpublishedReasonId`
  FK), matching the existing `ServiceCategory`/`ServiceTag` pattern (schema.prisma:842-884). Only real
  benefit over Option B: new values could be added by inserting a row instead of a migration. Considered
  and **rejected for now** — that benefit only actually reaches the data manager if paired with a
  self-service admin screen to manage the table, and this codebase has no existing precedent for one
  (`ServiceCategory`/`ServiceTag` themselves are only ever edited by engineers today). Building that
  screen is real, separate scope beyond the status field itself, and isn't justified yet.

**Decision: Option B — a native enum column.** Matches the existing `Report.status: ReportStatus
@default(PENDING)` precedent (schema.prisma:962, ~2215) exactly: required, indexed/filterable,
defaultable. **Accepted trade-off:** adding, renaming, or retiring a reason value requires an engineering
change (migration + deploy), not a self-service edit — reasonable given how infrequently this list should
actually change (data manager expects to finalize the first-pass list with Abby Davies once, not iterate
on it regularly) and the small number of values (five). If the list turns out to need frequent editing in
practice, revisit as a fast-follow migration to Option C plus a small management screen — the enum-to-
lookup-table migration path is mechanical (new table + backfill from the enum, swap the column) if that
day comes.

## Scope guardrail

Everything above is additive or a deliberate, called-out replacement (Publish Status → Status; the two
dead hidden columns removed; Audit Log/Internal Notes relocated into a ⋮ overflow). Nothing else about
the Organizations table's current behavior or layout should change as a side effect of this work —
sorting, pagination, global search, the `lastVerified`/`updatedAt`/`createdAt` date-range filters, row
expansion into locations, deleted-row strikethrough styling, the already-shipped Create Method filter,
and the `AuditDrawer`/`InternalNotesDrawer` components themselves (only their trigger location moves)
all stay exactly as they are today.

## Open questions still needed before implementation

- Final sign-off on the status value list (and their exact wording) from Abby Davies.
- Historical backfill and the migration itself: deliberately deferred until the UI/workflow design above
  is fully settled, not because it's forgotten.
- Interaction with the existing soft-delete workaround: does shipping this status field change how/when
  staff use soft-delete for unverifiable orgs, or do the two mechanisms coexist independently?

## Related Files

| Path                                                                                                                                | Purpose                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [`docs/DataPortal/2026-Redesign/organization.md`](./organization.md)                                                                | Phase B backlog — sizing estimate for this item                                                           |
| [`docs/DataPortal/Organizations/README.md`](../Organizations/README.md)                                                             | Current Organizations table doc — toolbar filter pattern this would extend                                |
| `packages/db/prisma/schema.prisma` (`Organization` model)                                                                           | Where the new column would live (Option B)                                                                |
| [`packages/ui/components/data-portal/InternalNotesDrawer.tsx`](../../../packages/ui/components/data-portal/InternalNotesDrawer.tsx) | Existing `InternalNote` UI (Option A)                                                                     |
| [`packages/ui/components/data-portal/OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx)     | Where the new toolbar filter and row action would be added                                                |
| [`packages/ui/components/sections/Navbar.tsx`](../../../packages/ui/components/sections/Navbar.tsx)                                 | `EditModeBar` — org edit page's Publish/Unpublish toggle, needs the asymmetric reason-prompt treatment    |
| `packages/api/router/component/mutation.EditModeBarPublish.schema.ts` / `.handler.ts`                                               | Backend for the edit page's toggle — needs a reason parameter, required only for `Organization` unpublish |
| [`packages/api/router/report/mutation.update.handler.ts`](../../../packages/api/router/report/mutation.update.handler.ts)           | Precedent for the optional-note-in-the-same-transaction pattern                                           |
