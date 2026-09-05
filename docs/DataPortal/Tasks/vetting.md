# Vetting

## Overview

Brings organization vetting in-app, replacing the external process: a 12-section Google Form
(the vetting questionnaire), a manually-maintained Google Sheet (the Vetting Assignment Sheet),
and Google Sheet-based outreach tracking. Lives inside the Data Portal's `Tasks` tab — see
[`README.md`](./README.md) — as a `Vetting` side-nav item within it, alongside a related but
distinct `Reverify` side-nav item (see [Reverify](#reverify) below) for periodically rechecking
orgs that are _already_ published.

**Status: designed, not built.** This doc captures the data model, workflow, and open decisions
worked out during design. A full interactive click-through mockup exists (a five-stage guided
workflow, the 12-section questionnaire, and a Data Entry Wizard concept) but isn't part of the
codebase — treat this doc, not the mockup, as the source of truth going forward.

## The pipeline

Five stages per organization, each gating the next:

1. **Vet** — the questionnaire. Outcome: Pass / Inconclusive / Fail.
2. **Outreach & Permission** — only reachable on Pass. Confirms the org's okay with being listed.
3. **Data Entry** — only reachable once permission is granted. Fills out the org's real profile.
4. **Publish** — only reachable once Data Entry's pre-publish checklist is complete.
5. **Follow-up** — only reachable once published. Sends the org a link to their live profile.

Fail (at Vet) and no-response-after-3-attempts (at Outreach) are both terminal — the org is
unpublished (or never published) and exits the pipeline without reaching Data Entry.

## Finding & queuing organizations

Deliberately **not** rebuilt: a data manager finds candidates using the existing Organization
table's search/filter/sort. Nothing new is needed there.

Marking an org "to be vetted" (singly or in bulk) happens **on the Organizations tab**, not inside
Tasks. The Vetting Queue shown under Tasks is a separate, dedicated table/query (see below) — not
the Organizations tab's table reused with a filter — narrowed to fewer columns and different row
actions.

**The candidate pool** a data manager searches/filters within to decide what to mark is concretely:
`Organization.published = false AND Organization.deleted = false AND no VettingRecord exists yet`.
This pool is expected to be noisy — "unpublished" predates the current reason system, so a lot of
what's sitting unpublished today isn't a clean, trustworthy to-do list. That's exactly why marking
has to be a deliberate, explicit action rather than an automatic filter: a live filter on
`unpublishedReason` alone would hand volunteers the unreviewed backlog (every public suggestion-form
submission included) with no curation step in between.

**Bulk row-selection is already a proven, reusable pattern — not something to build.** Confirmed by
reading [`BulkSearchReplaceTable.tsx`](../../../packages/ui/components/data-portal/BulkSearchReplaceTable.tsx):
it already wires up `DataTable`'s `rowSelection`/`onRowSelectionChange`/`enableRowSelection` props,
with a bulk-action bar above the table showing a live selected count ("Add / Remove Tag or Attribute
(N)"), disabled when nothing's selected. "Mark to be vetted" on the Organizations tab should copy
this exact pattern — same `rowSelection` state shape, same bulk-action-bar placement, a new mutation
built the same way `handleReplaceAll` filters the full result set down to `selectedKeys`. (Note:
`OrganizationTable.tsx` itself doesn't use this yet — the capability lives in `DataTable` and in
`BulkSearchReplaceTable`'s usage of it, not in every table that could use it.)

## Assignment vs. Claimed — do not conflate

- **"Assigned to"** (an internal staff/volunteer working an org's vetting) is **purely an
  informational marker** — "hey, this is already being worked on," nothing more. It does **not**
  grant or gate edit access: anyone with `dataPortalBasic+` can already edit any org today,
  assigned or not, and that stays true regardless of who's assigned. This means assignment is a
  plain field, not an `OrganizationPermission` grant (an earlier version of this doc proposed
  reusing that relation — corrected: conflating "who's working this" with "who's allowed to edit
  this" was the wrong move, since the two questions have different answers).
- **Resolved: assignment is exclusive.** One person at a time — the entire point is preventing
  duplicate work, which an additive/multi-assignee model wouldn't guarantee.
- **Resolved: no permission-tiered UI.** There's no distinct "self-assign" vs. "assign someone else"
  flow gated by role. It's one field: show the current value (or empty), let any data manager
  change it directly.
- **"Claimed"**, inside the public app, means something else entirely: an org's own staff member,
  vetted separately, linked via [`UserToOrganization`](../../../packages/db/prisma/schema.prisma)
  (line 1428), with a login scoped to editing only their own org. Different users, different
  mechanism — the two should never share a name or a field.

**Open, not resolved:** does the assignee marker get cleared once the pipeline concludes (Follow-up
sent, or a terminal exit), or does it stay pointing at whoever last worked the org? Since it's just
a plain field now (not a permission grant), there's less urgency to clear it than there would be if
it conferred access — but it's still an open lifecycle question.

## Vetting workflow state (per-org)

Assignee, current pipeline stage, and "queued at" all belong to **one small, mutable, per-org
record** — not scattered onto `Organization` itself, and not derived ad hoc from `VettingRecord`/
`OutreachAttempt` on every read. Those two are append-only history (every questionnaire submission;
every contact attempt) — genuinely different from "what's the current state right now," which needs
its own row:

```
OrgVettingState        // name TBD
  organizationId  → Organization, unique
  assignedToId    → User, nullable
  queuedAt        DateTime
  // current stage is likely still derived (see Vetting Queue table below), not cached here,
  // unless read performance says otherwise
```

**Open: does this one table serve both Vetting and Reverify, or does each need its own?** An org is
either unpublished (a Vetting candidate) or published (a Reverify candidate) — never both — so one
shared "who's assigned, when did this round start" table could plausibly cover both flows instead of
two nearly-identical ones. Not yet confirmed.

**Schema mechanics not yet decided, across `VettingRecord`/`OutreachAttempt`/`OrgVettingState`/
`ReverifyRecord` (see [Reverify](#reverify)) alike:**

- Naming convention — `Org*` prefix (matching `OrgLocation`/`OrgService`) or no prefix (matching
  `InternalNote`/`AuditTrail`/`Suggestion`)? The codebase uses both today, no clear rule to follow.
- Should `outcome`/`method`/`phase` be real Prisma enums (matching `OrgUnpublishedReason`) rather
  than plain strings?
- `onDelete: Cascade` on every `organizationId` FK, matching the pattern already used on
  `OrgLocationService`?
- `organizationId @unique` on `OrgVettingState` — one active state row per org, confirmed?

## Vetting Queue table (UI)

**Own dedicated query**, not a filter param bolted onto the query behind `OrganizationTable` —
separation of concerns, since this needs to join `OrgVettingState`/`VettingRecord`/
`OutreachAttempt`, which the general org list has no reason to.

**Columns**, in order: Name, **Status**, **Workflow Step**, Assigned to, plus `Verified` / `Updated`
/ `Created` present but `hiddenByDefault: true` (same convention `BulkSearchReplaceTable` already
uses for its own date columns) — toggleable via the existing show/hide-columns menu, not deleted.

**Status vs. Workflow Step — two different columns, not duplicates of each other:**

- **Status** shows the pipeline value — described in detail in the value list below.
- **Workflow Step** is where the action lives (`Continue`/`View`) — a single dynamic control, not a
  multi-icon actions cluster like `OrganizationTable`'s `ActionsCell`. What it does changes based on
  where the org currently sits in the pipeline (open the questionnaire if Vet's still in progress,
  open the workflow overview otherwise) — same routing logic already proven in the mockup.
  **Not fully resolved:** exactly what this column shows/does once an org is no longer active
  (terminal fail, or Published) — still a click-target (e.g. "View" to see the historical record),
  or inert/blank once there's nothing left to _do_? Also open: does the control's own label double
  as the stage name, or is the stage name separate text next to a generic button?

**Status value list** — new values only for states with no existing real-world equivalent; every
terminal value reuses what's already real and meaningful rather than inventing parallel terminology:

- _In progress (new):_ `Vetting` → `Awaiting permission` → `Data entry` → `Follow-up due`
- _Terminal, reused from the existing `unpublishedReason` enum:_ `Inactive`, `Unaffirming`
- _Terminal, same enum value but two distinct moments — labeled to disambiguate which:_
  `Unresponsive — vetting` (didn't respond when contacted to confirm still active/legit) vs.
  `Unresponsive — outreach` (no response after 3 permission-outreach attempts)
- _Terminal, happy path:_ `Published` — no separate "Vetting Complete"/"Done" value; once
  everything's actually finished, the org's real status is already the correct, meaningful label.
  **Once Published, the org drops out of this table entirely** — it's a worklist of active vetting,
  not a permanent record of everything that's ever passed through.

**Resolved, no longer open:**

- Filters: yes.
- Sort: yes, on every visible column, not a restricted subset.
- No row-selection/bulk actions on this table — bulk marking happens upstream on Organizations.
- `getRowId`: `organizationId` only, no `getSubRows` — Data Entry/vetting concerns don't need the
  location-expansion nesting `OrganizationTable` uses.
- Permission gate: `dataPortalBasic+` — matches how publish-status-adjacent actions are already
  gated (no elevated tier required).
- No separate "remove from queue" action — if an org genuinely shouldn't be there, the existing
  soft-delete (`Organization.deleted`) already removes it, since deleted orgs fall outside the
  candidate pool by definition.

## Stage 1: Vet

New model needed — no existing table captures this:

```
VettingRecord
  organizationId  → Organization
  userId          → who submitted it
  responses       Json   // raw answers; same pattern as Suggestion.data
  outcome         enum   // PASS | INCONCLUSIVE | FAIL
  createdAt
```

The questionnaire mirrors the real 12-section Google Form as closely as possible: Criteria 1
(Active — website/social/responds-to-contact, asked linearly), Criteria 2 (Affirming — an 8-item
checklist plus a red-flags checklist, which appears **twice** in the source form — almost certainly
a copy/paste artifact worth fixing rather than preserving if this gets built), Criteria 3
(Intersectional / Intersectional Focus — Preferred, doesn't gate Pass/Fail).

**Branching logic below is a reconstruction from the written criteria, not confirmed against the
live Google Form's actual conditional logic.** Needs verification before being treated as spec:

- All three Active questions are asked before any decision — if none are Yes, → Fail.
- Any red flag checked (either red-flag section) → Fail, regardless of the affirming count.
- ≥3 affirming signals and no red flags → continue to Intersectional → Pass.
- <3 affirming signals and no red flags → Inconclusive. (How Inconclusive actually routes —
  loop back into a targeted outreach task to resolve the open question? re-vet later? — is not
  decided.)

**Sections 8 & 9 (leadership / focus) reuse the existing attribute system, not new fields.**
Confirmed in [`schema.prisma`](../../../packages/db/prisma/schema.prisma):
`AttributeCategory` (line 750) / `Attribute` (line 767) / `AttributeSupplement` (line 805), with two
relevant categories already seeded: `organization-leadership` (BIPOC-led, Black-led, Immigrant-led,
LGBTQ+ Led, Transgender-led, Women-led) and `service-focus` (BIPOC Community, LGBTQ+ Youth, Trans
Community, Trans Fem, Trans Masc, Gender Non-Conforming, HIV Community, Immigrant Community,
Resettled Refugees, Asylum Seekers, Spanish Speakers, Trans Youth). Selecting these during vetting
should call the same
[`organization.updateAttributesBasic`](../../../packages/api/router/organization/mutation.updateAttributesBasic.handler.ts)
mutation the real [`BadgeEdit`](../../../packages/ui/modals/BadgeEdit/index.tsx) modal already uses
— so the badges land on the org immediately, and Data Entry never asks again. Two notes:

- The real taxonomy is more granular than the form (form bundles "TGNC community" into one
  checkbox; real taxonomy splits Trans Community / Trans Fem / Trans Masc / Gender Non-Conforming).
  Leadership is naturally multi-select here too (an org can be both Trans-led and BIPOC-led),
  unlike the form's single-select framing.
- Two form options — **Disability community** and **Survivors of conversion therapy** — don't have
  a confirmed matching attribute tag yet. Gap to close before this fully replaces the form.
- Per the Data Portal Instructions doc's existing parent/child rule (checking Black-led should also
  check BIPOC-led; Transgender-led should also check LGBTQ+ Led), the picker should auto-apply that
  default rather than rely on the person remembering it.

**Outcome handling is transactional**, mirroring
[`EditModeBarPublish`](../../../packages/api/router/component/mutation.EditModeBarPublish.handler.ts):
reaching Fail writes the `VettingRecord`, sets `Organization.unpublishedReason`
(`INACTIVE` for an Active-fail, `UNAFFIRMING` for an Affirming-fail), and drops an auto-generated
`InternalNote` — all in one transaction. This replaces three separate manual steps in the current
process (add a note, unpublish, update the sheet) with one atomic action that can't drift out of
sync.

**Known gap:** there's currently no way to review a _completed_ questionnaire's full answers later
— only a one-line outcome summary. A read-only "View full responses" affordance, following the same
drawer pattern as the existing "View internal notes" / "View audit log" actions, should be added.

**Worth confirming with the team:** the current Google Form likely already writes to its own
auto-generated "Form Responses" spreadsheet (standard Google Forms behavior), separate from the
manually-maintained Vetting Assignment Sheet. If so, raw historical answers may already exist
somewhere — relevant to any future migration, even if out of scope for a first build.

## Stage 2: Outreach & Permission

New model needed:

```
OutreachAttempt
  organizationId  → Organization
  method          enum   // phone | email | dm | contact_form
  phase           enum   // permission | followup — same model, both moments
  result          // no_response | granted | declined, etc.
  loggedById      → who logged it
  createdAt
```

Two real paths, per the written outreach workflow:

- An org that passes vetting cleanly on web presence alone gets **flagged for the Executive
  Director** to reach out directly — not run through the volunteer cadence.
- Anything less clear-cut goes through **3 attempts, by 3 different methods, 10–14 days apart**.
  No response after the 3rd attempt closes the org without publishing — the same dead end as a
  Fail.
- **Silence counts as permission**: the outreach template asks the org to reply only if they'd
  rather _not_ be listed. No reply within the window is logged as granted, same as an explicit yes.

**Decided:** this is tracked in-app as its own gated step with a real attempt log and cadence — not
left as a manual side-channel (unlike org discovery, which stays external), and not reduced to a
single checkbox. Data Entry stays locked until permission is logged as granted.

**Not decided:** whether the 10–14 day cadence is enforced with automated reminders (new
infrastructure — scheduled jobs, notifications) or stays a manual log for a first version. Treat
automated reminders as a separate, later ask unless explicitly requested.

## Stage 3: Data Entry

Reuses the real `org/edit` page and its existing mutations — not a new screen. Per
[`edit.tsx`](../../../apps/app/src/pages/org/[slug]/edit.tsx): `ListingBasicInfo` (name/description/
badges) + a stack of `LocationCard`s (each with its own associated services) + `ContactSection`.

**Real hierarchy:** Organization → many Locations → many Services, where a service is linked to a
location via [`OrgLocationService`](../../../packages/db/prisma/schema.prisma) (line 1697), a
many-to-many join — the same service can be associated with more than one location without
re-entering it.

**Remote services are not tied to any location at all.** Confirmed directly against
[`OrgService`](../../../packages/db/prisma/schema.prisma) (line 628): there is no `locationId`
field on the model — the only path to a location is the optional join table above, which can have
zero rows for a given service. "Remote" is purely an attribute tag (`offers-remote-services`), not
a schema-level type and not a hidden placeholder location. The real edit page has a dedicated
"Add Remote Service" button, separate from "Create new Location," opening the same
[`ServiceEditDrawer`](../../../packages/ui/components/data-portal/ServiceEditDrawer/index.tsx)
without `attachToLocation` set (confirmed in
[`mutation.upsert.handler.ts`](../../../packages/api/router/service/mutation.upsert.handler.ts) —
the `OrgLocationService` create is conditional on `attachToLocation`, which this flow never sets).
Remote services surface in their own "Remote Services" section/page, not folded into any location's
service list. Coverage area (state/county/national, via
[`ServiceArea`](../../../packages/db/prisma/schema.prisma) line 672) works identically whether a
service belongs to a location or is fully remote — the model supports `organizationId` /
`orgLocationId` / `orgServiceId` independently.

**Open question, not confirmed:** whether an org can actually appear in search results with zero
Locations and only remote Services, or whether at least one Location card (even one with its
address hidden) is still required for discoverability. The Instructions doc's "at least one
published location card with at least one published service" language may or may not still be a
hard rule.

**Whatever UI ends up here must call the exact same mutations the real drawers already call** —
`organization.updateAttributesBasic`, the location create/update mutation, `service.create` /
`service.upsert`, the `ServiceArea` mutation — not a parallel data path. A guided wizard, if built,
is a new UI/UX layer over existing backend surface area, not new endpoints.

**Should pre-fill from vetting.** Leadership/focus badges captured in Stage 1 should already be set
on the org (see above) by the time Data Entry opens, and the org's identity shouldn't need
re-entering. This is a real design requirement, not yet reconciled in the current mockup (which has
two separate, disconnected data-entry surfaces — one simple view that does pull vetting badges in,
and a separate richer "wizard" exploration that doesn't). Whichever surface is actually built should
be the one thing that opens here, pre-filled.

Field-level rules (org name formatting, the affirming-sentence requirement on description, contact
info incl. "no longer link to Twitter/X," the Location-vs-Address distinction, the address
visibility rule set, wheelchair accessibility, service naming requiring a verb, the coverage-area
decision tree, the full attribute taxonomy) live today only in the team's **Data Portal
Instructions** doc (a PDF, not in this repo). The in-app design goal is to surface these same rules
as guided questions/inline validation instead of requiring someone to have read a separate manual.

## Stage 4: Publish

Reuses the existing `EditModeBarPublish` transaction — flips `published: true`, clears
`unpublishedReason`. Gated behind a **computed** pre-publish checklist (derived from what's actually
been entered), not one a person self-verifies against the instructions doc.

## Stage 5: Follow-up

Sends the org a link to their now-live profile. Same `OutreachAttempt` model as Stage 2, logged
with `phase: followup` — a different moment (post-publish "here's your profile"), not a different
model from the pre-publish "may we list you" outreach.

## Reverify

A related but distinct flow, its own side-nav item under `Tasks` next to `Vetting` — periodically
rechecking orgs that are **already published**, not getting a new org published for the first time.
Data cleanup on already-_unpublished_ orgs is a separate concern, out of scope here.

**The key inversion:** Vetting starts an org unpublished and only publishes it on Pass. Reverify
starts an org published and **only unpublishes it on Fail** — it stays published by default while
being rechecked.

**Entry query:** `Organization.published = true AND lastVerified < (now - filter)`. One table (same
shape as the Vetting Queue, not a separate tiered dashboard), with a day-threshold filter in the
toolbar — presets 60 / 90 / 120 days plus a custom range, defaulting to 90. Default sort:
`lastVerified` ascending (oldest first), so orgs stale by years surface at the top regardless of
which threshold is selected — no separate "extremely overdue" tier needed.

**Reused as-is from Vetting, for now:**

- The recheck itself is the same 12-section questionnaire, not a shortened version.
- Outcome values: same enum, Pass / Inconclusive / Fail.
- Table columns: same set (Name, Status, Workflow Step, Assigned to, + hidden Verified/Updated/
  Created).
- Permission gate: same `dataPortalBasic+`.
- Status / Workflow Step vocabulary: same values as Vetting's.
- A Fail unpublishes using the same transaction/reason codes as Vetting's Fail.
- Assignment: same mechanic (exclusive marker, no permission implication).

**New for Reverify:** its own `ReverifyRecord` table — append-only, same shape as `VettingRecord`
(`organizationId`, `userId`, `responses` Json, `outcome` enum, `createdAt`) but kept separate rather
than reusing `VettingRecord` directly, so "this was the original vet" and "this was a periodic
recheck" aren't conflated in one table with a type flag. Every row is kept, no pruning — an org gets
reverified many times over its life, and the history (what changed, when, by whom) is the point.

**Not yet resolved:**

- Does Reverify need its own Outreach & Permission or Follow-up stages, or do both drop out entirely
  since the org's already listed and already knows it? (Permission presumably still holds; there's
  nothing new to tell them the way a brand-new listing has.)
- What does Inconclusive mean for an already-published org — does it just stay published,
  un-urgently, while someone resolves the open question? That's a real asymmetry from Vetting, where
  Inconclusive means _not yet_ published.
- Does a successful recheck need an explicit "done" action beyond bumping `lastVerified` (the
  existing **Reverify** button, per the Data Portal Instructions doc, already does exactly this on a
  published org today — likely the action to reuse here rather than inventing a new one)?
- Does exclusive assignment matter as much here? Vetting needed it to prevent duplicate work on
  something that doesn't exist yet; reverifying the same org twice isn't harmful the same way.

## Accountability — "who did what"

| Question               | Answer                                                                                                                                                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Who vetted this org?   | `VettingRecord.userId` — clean, one record per submission.                                                                                                                                                                                                                        |
| Who logged an attempt? | `OutreachAttempt.loggedById` — clean.                                                                                                                                                                                                                                             |
| Who published it?      | Already covered — the `AuditTrail` diff on `published`, or the auto-generated `InternalNote` from the same transaction, both carry an actor.                                                                                                                                      |
| Who did data entry?    | **No single clean answer.** Data entry is a series of ordinary field edits, possibly by more than one person over time, tracked only generically via per-field `AuditTrail` entries — not a single "I finished data entry" event. Known limitation, not necessarily a gap to fix. |

## Data model: reused vs. new

**Reused as-is:** the `Attribute`/`AttributeCategory`/`updateAttributesBasic` system (leadership &
focus), `InternalNote`, `AuditTrail`, the org edit page and `EditModeBarPublish`'s transaction
pattern, the `DataTable` component pattern (incl. its row-selection/bulk-action-bar pattern, already
proven by `BulkSearchReplaceTable`).

**Genuinely new:** `VettingRecord`, `OutreachAttempt`, `OrgVettingState` (assignee + queued-at, kept
separate from the two append-only history tables above), and — the one piece with zero precedent
anywhere in this codebase — a multi-step/wizard UI pattern. No `Stepper` is used anywhere today; the
closest existing form (`SuggestOrg`) is a single flat scroll, not a guided sequence.

## Suggested phasing

1. **Vet + outcome→publish transaction** — most self-contained, highest leverage; doesn't need the
   queue or assignment infrastructure to deliver value on its own.
2. **Queue + assignment** — small, additive, unblocks volunteers finding work.
3. **Outreach/permission tracking**, scoped to manual logging first; automated cadence reminders
   treated as a separate, later ask, not assumed in scope.

The guided-workflow overview screen (the 5-stage view showing what's locked/current/done) can be
built incrementally alongside all three phases rather than saved for last, since it's a thin layer
over data the other phases are already producing.

## Open questions / decisions needed

1. Confirm the questionnaire's real branching logic against the live Google Form.
2. Does the `OrgVettingState.assignedToId` marker get cleared once the pipeline concludes, or stay
   pointing at whoever last worked the org?
3. How does an Inconclusive outcome route — back into a targeted outreach task, a re-vet later, or
   something else?
4. Are outreach cadence reminders automated, or manual-log-only for a first version?
5. Confirm/resolve the two unmapped community-focus tags (Disability community, Survivors of
   conversion therapy).
6. Can an org be published/discoverable with zero Locations and only remote Services?
7. Does historical Google Form response data exist in a separate sheet worth migrating?
8. Vetting Queue table: what does the **Workflow Step** column show/do for a row that's no longer
   active (terminal fail, or Published) — still a click target, or inert once there's nothing left
   to do?
9. See the [Reverify](#reverify) section's own "Not yet resolved" list for that flow's open items.

## Explicitly out of scope

- Rebuilding org discovery/search — reuses the existing Organization table as-is.
- Automated outreach cadence reminders, unless separately requested.

## Related Files

| Path                                                                                                                                                                                                                         | Purpose                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/db/prisma/schema.prisma`](../../../packages/db/prisma/schema.prisma)                                                                                                                                              | `Organization`, `UserToOrganization`, `InternalNote`, `AuditTrail`, `AttributeCategory`/`Attribute`/`AttributeSupplement`, `OrgService`/`OrgLocationService`/`ServiceArea` |
| [`packages/api/router/organization/mutation.updateAttributesBasic.handler.ts`](../../../packages/api/router/organization/mutation.updateAttributesBasic.handler.ts)                                                          | Leadership/focus badge mutation to reuse                                                                                                                                   |
| [`packages/api/router/component/mutation.EditModeBarPublish.handler.ts`](../../../packages/api/router/component/mutation.EditModeBarPublish.handler.ts)                                                                      | Publish/unpublish transaction pattern to reuse for the Vet-outcome and Publish stages                                                                                      |
| [`packages/api/router/service/mutation.create.handler.ts`](../../../packages/api/router/service/mutation.create.handler.ts), [`mutation.upsert.handler.ts`](../../../packages/api/router/service/mutation.upsert.handler.ts) | Service creation, incl. the remote-service (no `attachToLocation`) path                                                                                                    |
| [`packages/ui/modals/BadgeEdit/index.tsx`](../../../packages/ui/modals/BadgeEdit/index.tsx)                                                                                                                                  | Leadership/focus badge picker UI to reuse                                                                                                                                  |
| [`packages/ui/components/data-portal/ServiceEditDrawer/index.tsx`](../../../packages/ui/components/data-portal/ServiceEditDrawer/index.tsx)                                                                                  | Service create/edit UI, incl. remote services                                                                                                                              |
| [`packages/ui/components/data-portal/DataTable/index.tsx`](../../../packages/ui/components/data-portal/DataTable/index.tsx), [`OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx)    | Table pattern the Vetting Queue reuses                                                                                                                                     |
| [`packages/ui/components/data-portal/BulkSearchReplaceTable.tsx`](../../../packages/ui/components/data-portal/BulkSearchReplaceTable.tsx)                                                                                    | Proven row-selection + bulk-action-bar pattern to copy for "mark to be vetted"                                                                                             |
| [`packages/ui/components/data-portal/DataPortalHeaderBar.tsx`](../../../packages/ui/components/data-portal/DataPortalHeaderBar.tsx)                                                                                          | Defines the currently-disabled `Tasks` section this lives under                                                                                                            |
| [`apps/app/src/pages/org/[slug]/edit.tsx`](../../../apps/app/src/pages/org/[slug]/edit.tsx)                                                                                                                                  | Real org edit page Data Entry reuses                                                                                                                                       |
| [`Tasks/README.md`](./README.md)                                                                                                                                                                                             | Parent section this doc's feature lives under                                                                                                                              |
| [`2026-Redesign/organization.md`](../2026-Redesign/organization.md)                                                                                                                                                          | Backlog entry pointing here                                                                                                                                                |

---

_Last verified against code: 2026-09-02._
