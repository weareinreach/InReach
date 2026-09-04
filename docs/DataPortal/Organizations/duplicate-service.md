# Duplicate a Service

> **Status: Implemented (v1).** The mutation, wizard, and schema change described below are real,
> shipped code — every path in this doc is now a real file, not a proposal. The UI-only test cases
> (#11, #13, plus a few more added along the way) are real, passing automated tests
> (`packages/ui/modals/dataPortal/DuplicateService/index.test.tsx`). The backend cases (everything
> else in the table) still aren't — `packages/api` has no test runner at all yet, so those remain a
> manual QA checklist until that infrastructure exists. Two implementation decisions were made that
> weren't explicitly settled in the original design discussion — both are called out inline below
> and in [Known Issues / Gotchas](#known-issues--gotchas).

## Overview

Lets Data Portal staff create a new `OrgService` pre-filled from an existing one, instead of
re-entering shared metadata (contact info, languages, wheelchair access, cost, eligibility, hours,
etc.) by hand. Solves a specific data-entry pain point: when one location actually runs more than
one distinct program/service, staff currently have to build each service entry from scratch even
though most of the fields are identical across them.

This was scoped as an unstarted backlog item in
[`docs/DataPortal/2026-Redesign/organization.md`](../2026-Redesign/organization.md)
("Duplicate a service (clone)" — sized "Medium") before this design session filled in the actual
behavior. Relocated here from `docs/AppFeatures/duplicate-service.md` once implemented, to live
alongside the rest of the Organizations section's documentation rather than the general app-features
tree — reachable from a service's edit drawer (org/location edit pages), not from the Organizations
section's side nav.

## Access

`service.duplicate` uses the `updateOrgService` permission — the same one that already gates
`service.upsert` (both its create and update branches) and `service.forServiceEditDrawer`
(`packages/api/router/service/index.ts`). This was a deliberate "no change" decision: duplicating
requires exactly the same access as creating or editing a service, not a separate or stricter
gate. `updateOrgService` resolves to the `editAnyOrg` ability
(`packages/api/lib/permissions.ts:44`); the location edit page that hosts this feature gates on
role tier — any of `dataPortalBasic`, `dataPortalManager`, `dataPortalAdmin`, `root`
(`apps/app/src/pages/org/[slug]/[orgLocationId]/edit.tsx:249`). Confirmed (against the actual
seeded role data, not visible in this repo's code): all four of those role tiers can currently edit
orgs, locations, and services, so there's no gap between "can reach the page" and "can actually
call the mutation."

## How It Works

- **UI (trigger, list row)**: `packages/ui/components/sections/ServicesInfo.tsx` — a `carbon:copy`
  `ActionIcon` sits beside (not nested inside) each service row's existing `ServiceEditDrawer`
  trigger, both wrapped in a `Group`. A button can't nest inside the row's own link/trigger, so the
  row was restructured from one single click target into two siblings.
- **UI (trigger, drawer)**: `packages/ui/components/data-portal/ServiceEditDrawer/index.tsx` — the
  drawer's header was split into two stacked rows: the top row now holds the existing "✕ Close"
  breadcrumb plus a new `carbon:copy` `ActionIcon`, opposite corners; the second row keeps the
  existing "Add Attribute"/"Save" buttons. The copy action is disabled under the same condition
  already used for "Add Attribute" — unsaved changes present, or still in `createNew`/not-yet-saved
  state (`hasFormChanges || (!data && isNew)`).
- **UI (wizard)**: `packages/ui/modals/dataPortal/DuplicateService/index.tsx` — grouped with the
  other staff-editing modals (`PhoneEmail/`, `Attributes/`, `AlertMessage/`), not under
  `packages/ui/modals/Service/` (which holds only the public-facing read-only `ServiceModal` —
  mixing that display-only concern with a staff-editing wizard would blur what's currently a clean
  split). A Mantine `Modal`, following the shell already established by
  `packages/ui/modals/dataPortal/PhoneEmail/index.tsx`: `createPolymorphicComponent` wrapping a
  trigger, `useDisclosure` for open state, `title={<ModalTitle breadcrumb={{ option: 'close', ... }} />}`,
  a `Stack` body opening with a `Title order={2}`. Built with plain React `useState` rather than
  react-hook-form — the form is small enough (one text field, five checkboxes, an optional location
  list) that pulling in a form library wasn't worth it. One panel, not a multi-step flow:
  - Name field, pre-filled `Copy of <source name>` (with a leading `Copy of ` on the _source_ name
    stripped first via `suggestName()`, so duplicating an existing copy doesn't compound into
    `Copy of Copy of X`), editable, required — the confirm button stays disabled while blank.
  - A checklist of categories to copy, all pre-checked by default: Attributes, Hours, Contact info,
    Coverage area, Service tags. Unchecking any subset — including all of them — is valid. Each
    checkbox has a tooltip spelling out what it actually includes — worth having, since "Attributes"
    alone bundles together seven visually-distinct drawer sections that all happen to live in the
    same underlying table (`AttributeSupplement`), differing only in which attribute each row
    references, not in which table they're stored in: Get Help, Clients Served, Cost, Eligibility
    Requirements (including the free-text "other, please describe" item), Languages, and Additional
    Information. **Visibility Status (Published/Deleted) is deliberately not one of the checkboxes
    at all** — it's not copyable, full stop; the new service always starts unpublished and
    non-deleted (see the "New services default to unpublished" note above), matching how every new
    service already behaves.
  - A location section, rendered only if the source service has more than one active
    `OrgLocationService` link — pick all/some/none via checkboxes, defaulting to all checked. If
    the source has zero links (remote) or exactly one, the wizard resolves this automatically with
    no UI: `locationIds` is sent as `[]` or the single link respectively.
  - One confirm button (`loading`-bound to the mutation's `isPending`, matching the exact
    double-submit guard `ServiceEditDrawer`'s own Save button already uses). No DB write happens
    until this is clicked — closing the wizard before confirming leaves zero trace.
  - No translation/locale work was needed for this UI — edit-mode screens in this codebase use
    hardcoded English strings by established convention (see the `i18next/no-literal-string`
    eslint-disable above the existing "Add new service" button,
    `apps/app/src/pages/org/[slug]/[orgLocationId]/edit.tsx:206`).
  - On success, the wizard invalidates `location`/`service` query caches, closes itself, and calls
    an `onSuccess?: (newServiceId: string) => void` prop — it does **not** import
    `ServiceEditDrawer` itself (that would create a circular import, since `ServiceEditDrawer` is
    what renders this wizard's trigger). Each caller (the drawer, the list row) owns its own small
    "auto-open a hidden `ServiceEditDrawer` for the new id" effect instead — see the two UI trigger
    bullets above.
- **API (mutation)**: `packages/api/router/service/mutation.duplicate.schema.ts` /
  `.handler.ts`, registered as `service.duplicate` in `packages/api/router/service/index.ts`.
  Input:
  ```
  sourceServiceId: prefixedId('orgService')
  name:            z.string().min(1)
  copyOptions: z.object({
    attributes:   z.boolean(),
    hours:        z.boolean(),
    contactInfo:  z.boolean(),
    coverageArea: z.boolean(),
    serviceTags:  z.boolean(),
  })
  locationIds:     prefixedId('orgLocation').array()
  ```
  Deliberately no `organizationId` field — the handler fetches the source service first and reads
  its actual `organizationId` off that row, never trusting a client-supplied value. It also
  verifies every id in `locationIds` belongs to that same organization
  (`prisma.orgLocation.findMany({ where: { id: { in: locationIds }, orgId: organizationId } })`,
  rejecting on any mismatch) before linking the new service to it. Returns `{ id: string }` — the
  new service's id, for the caller to open `ServiceEditDrawer serviceId={newId}`.
- **API (supporting query, added during implementation)**:
  `packages/api/router/service/query.forDuplicateWizard.schema.ts` / `.handler.ts`, registered as
  `service.forDuplicateWizard`. This wasn't an explicit line item in the original design — the
  wizard needs the source service's current name (to compute the `Copy of …` suggestion) and its
  active location links (to decide whether to show the location picker, and what to list in it),
  and nothing else already exposed that shape cheaply. Rather than extend the larger,
  already-load-bearing `forServiceEditDrawer` query, this is a small standalone query scoped to
  exactly what the wizard needs: `{ name: string, locations: { id, name }[] }`.
- **Data**: reads the source `OrgService` (`packages/db/prisma/schema.prisma`) and, per the
  wizard's checklist, copies rows from:
  - `AttributeSupplement` — Attributes category. Plain (non-free-text) rows are bulk-inserted via
    `createMany`; rows carrying their own free text (a minority — "other, please specify"-style
    answers) are written as three separate flat creates each (`translationKey` → `freeText` →
    `attributeSupplement`), mirroring `mutation.attachServiceAttribute.handler.ts`'s existing
    pattern, since `createMany` can't create the nested rows a free-text attribute depends on.
  - `OrgHours` — Hours category, bulk-inserted via `createMany`.
  - `OrgServicePhone`/`OrgServiceEmail`/`OrgServiceWebsite` — Contact info category. These are
    junctions pointing at existing `OrgPhone`/`OrgEmail`/`OrgWebsite` rows, so copying means new
    junction rows, not cloned contact records.
  - `ServiceArea` + its `ServiceAreaCountry`/`ServiceAreaDist` children — Coverage area category.
  - `OrgServiceTag` — Service tags category.
  - `OrgLocationService` — driven entirely by the wizard's `locationIds` input, not a blanket copy
    of the source's links.
  - A fresh `FreeText`/`TranslationKey` row for the (possibly edited) name — never reuses the
    source's `serviceNameId` (it's `@unique` on `OrgService`). Created with `crowdinId: null`
    deliberately (see the Crowdin-timing note below).
  - **Not copied: description.** The original design's category list (Attributes, Hours, Contact
    info, Coverage area, Service tags) never mentioned description, and there was no wizard field
    for it either. Rather than silently expand scope, the implementation leaves the duplicate's
    description blank — flagged here as a real gap worth a product decision, not an oversight. See
    [Known Issues / Gotchas](#known-issues--gotchas).
  - `crisisSupportOnly` is copied directly from the source (a simple scalar passthrough, not
    gated by any checklist category). `published` and `deleted` are always `false` on the new
    row, regardless of the source's state.

Things a reader would not expect from skimming one file:

- **The new service is created eagerly, before the edit drawer ever opens** — not staged
  client-side and committed on save the way plain "Add new service" works today
  (`ServiceEditDrawer/index.tsx` only calls `service.upsert` when the person clicks Save). This is
  deliberate, not an oversight: the drawer's sub-sections (attributes, hours, contact info,
  coverage area) are each wired to mutate a real, already-persisted `serviceId` — there's no
  staging layer for "render 15 rows across 7 tables as if they existed but haven't been saved yet."
  The wizard sidesteps this by only ever asking meta-questions (name, what to copy, which
  locations) that don't need a real record to exist — the one-shot `service.duplicate` transaction
  runs only once the wizard is confirmed, and the drawer that opens afterward is functioning in
  ordinary "edit an existing service" mode, not `createNew` mode.
- **New services default to unpublished**, not published, despite the form schema's
  `published: z.boolean().optional().default(true)` (`ServiceEditDrawer/schemas.ts`) suggesting
  otherwise — that Zod default only applies when the resolver parses input, but `handleSave` calls
  `form.getValues()` directly, bypassing it. With no explicit value, `published` reaches Prisma as
  `undefined` and falls back to the column default, `@default(false)`. The duplicate matches this:
  `published` is always explicitly set to `false`.
- **The service name's Crowdin registration is deferred for free — but this trick does not extend
  to copied attributes.** `syncDatabaseStringIfChanged` (`packages/crowdin/api/index.ts`) only
  skips calling Crowdin when a `previousCrowdinId` already exists _and_ the text is unchanged; when
  `previousCrowdinId` is `null`, it _always_ registers a new key. So the duplicate creates the
  name's `FreeText`/`TranslationKey` row with `crowdinId: null` and skips calling Crowdin entirely
  during duplication — the very next time the person saves in the drawer (even without touching
  the name), `upsert`'s existing update-branch diff logic registers it then, automatically, with no
  new code. This does **not** apply to copied attributes with their own free text: those are only
  ever written once (via `attachServiceAttribute`'s pattern), with nothing that would later notice
  and register a `null` crowdinId — so those must register with Crowdin _before_ the transaction
  opens, same as `attachServiceAttribute` already does.
- **A Crowdin failure partway through that attribute-registration loop cleans up after itself.**
  This required adding a new primitive: `packages/crowdin/common/apiFns.ts`'s `removeSingleKey`
  (wrapping the SDK's `client.sourceStringsApi.deleteString`) — nothing in this codebase's Crowdin
  wrapper could delete a key before this. `mutation.duplicate.handler.ts` wraps its
  registration loop in a try/catch: on failure at item N, it calls `removeSingleKey` for each of
  the already-succeeded keys 1..N-1 before re-throwing, so a partial failure doesn't orphan
  anything in Crowdin. The DB-write atomicity itself needed no new handling — Crowdin calls happen
  before `prisma.$transaction` opens, so a thrown error there means the transaction never starts,
  by construction (same property `mutation.upsert.handler.ts`'s create path already has).
- **`ServiceEditDrawer`'s name field is now actually required** — previously neither the Zod
  schema nor the `InlineTextInput` enforced this, so a brand-new service could be saved with no
  name at all. Fixed in the shared form (`FormSchema`'s `name` is now a stricter
  `RequiredFreetextObject`, the input has `required`, and `handleSave` blocks with
  `form.setError(...)` on a blank name) rather than only inside the wizard — this covers plain
  creation and normal editing too, not just duplication. A pre-existing service that predates this
  rule and has no name at all is handled by falling back to `{ text: '' }` when seeding form
  values, which is still blocked from saving until a real name is entered.
- **`duplicatedFromId` tracks only the immediate parent, not the original ancestor.** Duplicating a
  duplicate points the new row at the duplicate it came from, not back through the whole chain.
  No lineage-walking was built or is needed.
- **The wizard's checkboxes read `event.currentTarget` synchronously into a local variable before
  calling `setState`, not inside the state-updater callback — a real bug the automated tests
  caught, not a style preference.** A native DOM event's `currentTarget` is only valid while the
  event is actively dispatching; reading it inside a `setCopyOptions((prev) => ({ ...prev,
attributes: event.currentTarget.checked }))`-style updater risks React invoking that updater
  later than the event itself, by which point `currentTarget` has already been nulled by the
  browser, throwing `Cannot read properties of null`. Every checkbox handler captures
  `const checked = event.currentTarget.checked` first, then references `checked` inside the
  updater.
- **IDs are prefixed ULIDs generated via `ctx.generateId(...)`, not Prisma's `cuid()` default** —
  every child row (`FreeText`, `AttributeSupplement`, `ServiceArea`) keys off the _new_ service's
  id, never the source's, since those columns are `@unique` on `OrgService`.
- **Audit trail is automatic but has no cross-record memory.** `getAuditedClient(actorId)` makes
  every insert in the transaction show up in `AuditTrail` as a normal per-row insert — no
  special-casing needed. `duplicatedFromId` plus an auto-generated `InternalNote`
  (`"Duplicated from service \"<name>\""`) are what actually record the provenance.

### Schema change

A nullable self-relation on `OrgService` (`packages/db/prisma/schema.prisma`):

```
duplicatedFromId String?
duplicatedFrom   OrgService?  @relation("ServiceDuplicatedFrom", fields: [duplicatedFromId], references: [id], onDelete: SetNull)
duplicates       OrgService[] @relation("ServiceDuplicatedFrom")
```

`onDelete: SetNull`, not `Cascade` — a duplicate is an independent record; if its source is ever
hard-deleted (rare — everything in this schema is soft-deleted via a `deleted` boolean in normal
operation), the copy loses its provenance pointer rather than disappearing itself.

Migration:
`packages/db/prisma/migrations/20260904090000_add_orgservice_duplicated_from/migration.sql` — adds
the column, the FK constraint, and an index on `duplicatedFromId` (matching this schema's existing
convention of indexing every FK column).

**If `prisma migrate dev` reports drift and offers `migrate reset` to fix it, don't run that on a
database with real local data** — it wipes everything. That drift is pre-existing in at least one
local dev environment (an untracked `SearchSynonym` table and an `InternalNote` FK change,
unrelated to this migration) and isn't this migration's fault to fix. The narrower, non-destructive
path that actually worked: apply just this migration's SQL directly
(`prisma db execute --file <path to this migration.sql>`), then tell Prisma's tracker it's been
applied (`prisma migrate resolve --applied 20260904090000_add_orgservice_duplicated_from`) —
touches nothing else in the schema.

## How to Use It

1. From a service's row in the location (or remote services) edit page, click the copy icon in the
   top-right corner of that service's card — or, from inside an already-open service's edit
   drawer, click the same copy icon in the drawer's top-right corner.
2. A panel opens with the new service's name pre-filled as `Copy of <original name>`. Edit it if
   you want something else — it can't be left blank.
3. Below the name, uncheck any category you don't want copied (Attributes, Hours, Contact info,
   Coverage area, Service tags) — everything is checked by default.
4. If the original service is linked to more than one location, choose which of those locations
   the new service should also be linked to (or none). If it's linked to exactly one location, or
   none (a remote service), the new service automatically matches that — there's nothing to choose.
5. Click "Create duplicate." The new service is created immediately, unpublished, and its edit
   drawer opens with everything you selected already filled in — review, adjust anything that
   should differ from the original (including the description, which is never copied — see
   [Known Issues](#known-issues--gotchas)), and publish it when it's ready.

## Known Issues / Gotchas

- **Description is never copied**, unlike every other category. This wasn't an explicit decision —
  it's a gap the original design left, resolved conservatively during implementation by leaving it
  out entirely rather than guessing. If duplicated services routinely need the same description
  copied over too, this is a small, contained addition: fetch `source.description.tsKey.text` and
  generate a fresh `FreeText`/`TranslationKey` for it exactly the way the name already does.
- **Category granularity is per-block, not per-item.** Unchecking "Attributes" skips all of them
  (languages, wheelchair access, cost, eligibility, etc. together) — there's no way to copy some
  attributes but not others in this first version.
- **A duplicate-of-a-duplicate collapses the name prefix but doesn't dedupe against siblings.**
  Duplicating the same source twice produces two services both named `Copy of X` — nothing
  numbers them (`Copy of X (2)`, etc.).
- **An abandoned wizard leaves no DB trace** (nothing is written until the final confirm), but a
  _confirmed and then immediately abandoned_ duplicate (created, drawer opened, closed without
  further edits) is real, persisted, and unpublished — cleanup relies on staff noticing it in the
  service list and using the existing `Deleted` toggle. No dedicated "undo" was designed.
- **No automated test coverage exists for this feature** — see [Test Cases](#test-cases). The
  backend infrastructure to run most of these doesn't exist in this repo yet.

## Test Cases

These are written as automated-test cases. The ones tagged **UI** below are real, passing tests —
`packages/ui/modals/dataPortal/DuplicateService/index.test.tsx` (Vitest + Testing Library). The
ones tagged **Backend** are not: `packages/api` currently has no test runner at all (no test
script, no config, zero `.test.ts` files anywhere in the package), so those remain a manual QA
checklist until that infrastructure exists. See the infrastructure notes below for what that would
take. The UI test file also covers a few things beyond this table: the name pre-fills correctly
from the mocked source data, the location picker's conditional rendering (hidden for ≤1 locations,
shown and defaulted to all-checked for >1), and a full end-to-end assertion that confirming calls
the mutation with the exact expected input shape (edited name, chosen categories, unchecked
locations).

### Test infrastructure

- **Storybook Play is not an option, on two separate grounds.** `@storybook/test-runner` is
  installed but dormant — no `test-storybook` script, no CI workflow references it, and zero
  `.stories.tsx` files anywhere in the repo use a `play` function. Storybook here only renders
  against MSW-mocked tRPC responses for visual/Chromatic review — even with Play added, it could
  never assert real database side effects (row counts, atomicity, the Crowdin rollback), since
  there's no real Prisma transaction running underneath a story.
- **`packages/ui` already has a working, if thin, precedent** for the UI-only cases below: Vitest +
  Testing Library (`packages/ui/vitest.config.mts`), with one existing test file,
  `components/core/Rating.test.tsx` — mocks the tRPC hook directly via `vi.mock`, renders with RTL,
  asserts DOM.
- **CI already runs `packages/ui`'s suite on every PR** — `.github/workflows/test.yml`. Adding
  `packages/api` coverage means extending this same job (or a sibling one). It would need a real
  Prisma client (today's job runs `pnpm install --ignore-scripts`, which works only because
  `packages/ui`'s tests never trigger `packages/db`'s postinstall client generation), and, for
  real-database tests rather than a mocked Prisma client, a Postgres service container matching
  local dev's `postgis/postgis:15-3.4` image (`docker/docker-compose.yml`), not vanilla Postgres.
  This would be a real pre-merge PR gate once added, not a local-only convenience.
- **A separate, dormant E2E layer also exists**: `apps/app/playwright.config.ts`, built to point at
  a real deployed URL, with one existing test — not wired into any workflow today. A reasonable
  home for one true end-to-end smoke test later, not a substitute for the case-by-case coverage
  below.

| #   | Setup                                                                                                                                                                          | Wizard choices                                       | Expected result                                                                                                                                                                                                                                                   | Layer                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Remote service (0 location links), has attributes/hours/contact/coverage area/tags                                                                                             | All categories checked                               | New service created, `published: false`, `duplicatedFromId` = source id, **zero** `OrgLocationService` rows, all other categories copied                                                                                                                          | Backend (new suite)                                                                        |
| 2   | Service linked to exactly 1 location                                                                                                                                           | All categories checked                               | No location UI shown; new service auto-linked to that same 1 location; all categories copied                                                                                                                                                                      | Backend (new suite)                                                                        |
| 3   | Service linked to 3 locations                                                                                                                                                  | All categories checked, all 3 locations selected     | New service linked to all 3 locations via 3 new `OrgLocationService` rows                                                                                                                                                                                         | Backend (new suite)                                                                        |
| 4   | Service linked to 3 locations                                                                                                                                                  | All categories checked, 1 of 3 locations selected    | Exactly 1 `OrgLocationService` row created, for the selected location only                                                                                                                                                                                        | Backend (new suite)                                                                        |
| 5   | Service linked to 3 locations                                                                                                                                                  | All categories checked, 0 locations selected         | Zero `OrgLocationService` rows — duplicate behaves like a remote service despite the source having links                                                                                                                                                          | Backend (new suite)                                                                        |
| 6   | Single-location service with attributes, hours, contact info, coverage area, tags all present                                                                                  | Only "Attributes" checked, everything else unchecked | New service has copied `AttributeSupplement` rows only; zero `OrgHours`, zero contact-info junctions, no `ServiceArea`, zero `OrgServiceTag` rows; still auto-linked to the 1 location per case 2's rule (location linking isn't gated by the category checklist) | Backend (new suite)                                                                        |
| 7   | Single-location service, all categories present                                                                                                                                | All categories unchecked                             | New service created with just identity + name + location link (per case 2's rule) — no attributes/hours/contact/coverage/tags copied at all                                                                                                                       | Backend (new suite)                                                                        |
| 8   | Service named `Copy of Original` (itself a prior duplicate)                                                                                                                    | Any                                                  | New service's suggested name is `Copy of Original`, not `Copy of Copy of Original`                                                                                                                                                                                | UI (`packages/ui` Vitest+RTL) — `suggestName()` is pure client-side logic, tested directly |
| 9   | Service with 2 attributes carrying free text (e.g. "other, please specify" answers)                                                                                            | Attributes checked                                   | Both attributes' `FreeText`/`TranslationKey` rows are created with real Crowdin registration happening before the transaction opens (unlike the name, which defers)                                                                                               | Backend (new suite, Crowdin calls mocked)                                                  |
| 10  | Crowdin call for attribute #2 of 2 fails mid-duplication                                                                                                                       | Attributes checked                                   | Handler throws before `prisma.$transaction` runs — **zero** new rows in the DB; attribute #1's already-registered Crowdin key is removed via the compensating rollback (`removeSingleKey`) before the error propagates — **no orphaned key left behind**          | Backend (new suite, Crowdin calls mocked)                                                  |
| 11  | Wizard confirmed with the name field cleared to empty                                                                                                                          | —                                                    | Blocked client-side before the mutation is ever called                                                                                                                                                                                                            | UI (`packages/ui` Vitest+RTL) — implemented, passing                                       |
| 12  | Client submits a `locationIds` entry belonging to a different organization than the source service (e.g. a tampered/buggy request, not reachable through the normal wizard UI) | —                                                    | Handler rejects before any writes                                                                                                                                                                                                                                 | Backend (new suite)                                                                        |
| 13  | User double-clicks the wizard's confirm button, or clicks it again before the first request resolves                                                                           | All categories checked                               | Second click is a no-op — the button is disabled (via `loading={isPending}`) for the duration of the first request                                                                                                                                                | UI (`packages/ui` Vitest+RTL) — implemented, passing                                       |
| 14  | Duplicating a source service that is already `deleted: true`                                                                                                                   | Any                                                  | Proceeds exactly like duplicating a non-deleted one — no special block                                                                                                                                                                                            | Backend (new suite)                                                                        |

## Related Files

| Path                                                                                        | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/db/prisma/schema.prisma`                                                          | `OrgService` model — `duplicatedFromId` self-relation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `packages/db/prisma/migrations/20260904090000_add_orgservice_duplicated_from/migration.sql` | The migration itself                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `packages/db/lib/idGen.ts`                                                                  | `generateId('orgService')` / `ctx.generateId` — id generation used throughout the handler                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `packages/db/lib/generateFreeText.ts`                                                       | `generateFreeText`/`generateNestedFreeText` — name/description key derivation                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `packages/db/client/extensions/auditContext.ts`                                             | `getAuditedClient` — audit trail wrapper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `packages/crowdin/api/index.ts`                                                             | `syncDatabaseStringIfChanged` (deferred-registration behavior), `removeSingleKey` export                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `packages/crowdin/common/apiFns.ts`                                                         | `removeSingleKey` implementation (new)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `packages/api/lib/permissions.ts`                                                           | `orgService` permission mapping — `updateOrgService` → `editAnyOrg`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `packages/api/router/service/mutation.duplicate.schema.ts`                                  | Input schema for `service.duplicate`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `packages/api/router/service/mutation.duplicate.handler.ts`                                 | The duplicate transaction itself                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `packages/api/router/service/query.forDuplicateWizard.schema.ts`                            | Input schema for `service.forDuplicateWizard`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `packages/api/router/service/query.forDuplicateWizard.handler.ts`                           | Returns source name + active location links for the wizard                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `packages/api/router/service/mutation.upsert.handler.ts`                                    | Reference for the Crowdin-outside-transaction pattern and the "throw before transaction" atomicity property                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `packages/api/router/service/mutation.attachServiceAttribute.handler.ts`                    | Reference for copying an attribute that carries its own free text                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `packages/api/router/service/mutation.attachServiceTags.handler.ts`                         | Reference for the `createMany` bulk-insert pattern                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `packages/api/router/service/index.ts`                                                      | `duplicate` and `forDuplicateWizard` registration                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `packages/api/router/service/schemas.ts`                                                    | Barrel export (codegen-managed; both new schemas added manually)                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `packages/ui/components/data-portal/ServiceEditDrawer/index.tsx` / `schemas.ts`             | Existing edit drawer the wizard hands off to; the name-required fix; the drawer's own copy trigger and auto-open-follow-up-drawer logic                                                                                                                                                                                                                                                                                                                                                                                                      |
| `packages/ui/modals/dataPortal/DuplicateService/index.tsx`                                  | The wizard itself                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `packages/ui/modals/dataPortal/PhoneEmail/index.tsx`                                        | Shell precedent the wizard follows                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `packages/ui/modals/ModalTitle.tsx`                                                         | Shared modal header component the wizard reuses                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `packages/ui/components/sections/ServicesInfo.tsx`                                          | Service list rows — row-level copy icon and its own auto-open-follow-up-drawer logic                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `apps/app/src/pages/org/[slug]/[orgLocationId]/edit.tsx`                                    | Location edit page — existing "Add new service" trigger and its `i18next/no-literal-string` precedent                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `apps/app/src/pages/org/[slug]/remote/edit.tsx`                                             | Remote services edit page — same, for remote services                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `docs/DataPortal/2026-Redesign/organization.md`                                             | Original unscoped backlog mention of this feature                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `.github/workflows/test.yml`                                                                | Existing PR-gate workflow to extend with a `packages/api` test job + Postgres service container                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `docker/docker-compose.yml`                                                                 | Local-dev `postgis/postgis:15-3.4` Postgres image the CI service container would need to match                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `apps/app/playwright.config.ts` / `apps/app/tests/home.spec.ts`                             | Dormant E2E layer, not wired into any workflow today                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `packages/ui/modals/dataPortal/DuplicateService/index.test.tsx`                             | Real, passing Vitest+RTL tests for the wizard (new)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `packages/ui/modals/dataPortal/DuplicateService/index.stories.tsx`                          | Storybook story for the wizard (new)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `packages/ui/components/data-portal/ServiceEditDrawer/index.stories.tsx`                    | Updated to mock the two new endpoints the drawer now depends on internally                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `packages/ui/components/sections/ServicesInfo.stories.tsx`                                  | Updated with the same new mocks, plus a new `EditMode` story variant — the only story that actually exercises the edit-mode row path (and therefore the new copy icon) at all, since `isEditMode` is derived purely from the router pathname and the pre-existing `Desktop`/`Mobile` stories never set an edit-mode route                                                                                                                                                                                                                    |
| `packages/ui/mockData/service.ts`                                                           | New `forDuplicateWizard`/`duplicate` MSW mock handlers, used by all three story files above                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `packages/ui/vitest.config.mts` / `packages/ui/components/core/Rating.test.tsx`             | Existing Vitest + Testing Library setup and its one precedent test                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `packages/ui/test/setup.ts`                                                                 | Fixed two real gaps found while writing this feature's tests, benefiting every future test in the package: `SKIP_ENV_VALIDATION` wasn't set (anything transitively importing `~ui/components/core/ActionButtons` crashed on real env validation), and Testing Library's auto-cleanup between tests was silently never firing at all (`globals: false` means RTL can't auto-detect a global `afterEach` to hook into) — every test's rendered DOM was accumulating across the whole file, undetected until a test asserted on non-unique text |
| `packages/ui/test/test-utils.tsx`                                                           | Added `SearchStateProvider` to the shared render wrapper — `Breadcrumb` (pulled in by `ModalTitle`, used widely) reads this context unconditionally                                                                                                                                                                                                                                                                                                                                                                                          |

---

_Last verified against code: 2026-09-04. Implemented same-day. Update this doc's Related Files and
Known Issues if the description-copying gap or the test-infrastructure gap get addressed later._
