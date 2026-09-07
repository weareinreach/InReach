# Editing an Existing Service Attribute (In Place)

> **Status: Proposed — not yet implemented.** This doc captures a root-cause investigation and
> feasibility scoping session, not a shipped feature. No code has been written against this doc yet.

## Overview

Every attribute attached to a Service in the Data Portal (cost, eligibility, languages, target
population, "additional information," etc.) renders with Edit/Activate-Deactivate/Delete icons via
`AttributeEditWrapper`. The Edit icon has always been a stub — clicking it does nothing but pop an
`alert('To be implemented later')`. Staff work around this today by deleting the attribute and
re-creating it from scratch via the "Add Attribute" modal, per the internal "Data Portal Instructions"
guide (see [`field-descriptions.md`](./field-descriptions.md#known-ambiguities--not-fully-resolved),
which added a tooltip note about this workaround rather than fixing it).

This doc exists to answer two questions raised while scoping that tooltip: (1) is real edit-in-place
actually implementable, and (2) if an attribute is deleted instead, does its Crowdin-registered
translation string get cleaned up too? Short answers: **yes, implementable, and no, delete does not
currently clean up Crowdin at all** — both gaps are scoped below.

## Root cause (edit is a stub)

- **Frontend**: `packages/ui/components/data-portal/ServiceEditDrawer/AttributeEditWrapper.tsx:40-42`
  ```tsx
  const handleEdit = useCallback(() => {
  	alert('To be implemented later')
  }, [])
  ```
  This is reachable, not dead code — the `editable` flag is `true` for several real attribute types
  (eligibility age, eligibility "other," cost, public transit, target population, and any "additional
  info" attribute carrying free text/boolean/country/state/language values — see
  `packages/ui/modals/Service/processors/{eligAgeAttrib,costAttrib,eligOtherAttrib,publicTransit,targetPopAttrib,additionalAttrib}.ts`).
  Staff genuinely click a working-looking green pencil on common attribute types and get nothing but
  an alert box.
- **Backend**: `packages/api/router/component/mutation.AttributeEditWrapper.schema.ts` only defines
  `action: z.enum(['toggleActive', 'delete'])` — there is no `update`/`edit` action or payload shape at
  all. Even a working frontend button would have nowhere to send an edit today.
- **Delete has its own, separate gap** (see [Crowdin cleanup on delete](#crowdin-cleanup-on-delete)
  below): `mutation.AttributeEditWrapper.handler.ts`'s `delete` branch is a bare
  `prisma.attributeSupplement.delete({ where: { id } })` with no Crowdin cleanup and no cleanup of the
  related `FreeText`/`TranslationKey` rows either.

## Feasibility: editing an attribute's value

**Verdict: a contained, medium-sized feature, not a deep architectural problem.** The parts that sound
hard (multiple attribute "shapes," free text stored across three joined tables, Crowdin resync) all
already exist as working patterns elsewhere in this codebase.

- **Data model**: `AttributeSupplement` (`packages/db/prisma/schema.prisma:805-842`) is one flexible
  row (`active`, `data: Json?`, `boolean: Bool?`, `textId: String? @unique → FreeText`, `countryId`,
  `languageId`, `govDistId`, plus parent FKs), not per-shape tables. Which columns are populated is
  driven by the parent `Attribute` definition's `requireText`/`requireLanguage`/`requireGeo`/
  `requireBoolean`/`requireData` flags (`schema.prisma:777-781`) and, for `requireData`, a JSON-schema
  mini-form (`AttributeSupplementDataSchema`, ~15 shapes generated into
  `packages/db/generated/attributeSupplementSchema.ts`). The create UI already dispatches on this
  generically (`packages/ui/modals/dataPortal/Attributes/{index.tsx,fields.tsx}`) — edit mode reuses
  the same dispatch, it doesn't need to rebuild it.
- **Free text as three joined rows is not a blocker**: `TranslationKey` → `FreeText` →
  `AttributeSupplement.textId` (`@unique`, one-to-one) sounds like it'd force delete+recreate, but
  `generateNestedFreeTextUpsert` (`packages/db/lib/generateFreeText.ts:103-126`) already handles
  updating this in place, and is already parameterized for the `attSupp` entity type specifically.
- **Crowdin update-and-resync already has working precedent**: `syncDatabaseStringIfChanged`
  (`packages/crowdin/api/index.ts:53-73`) is already used by `orgPhone/mutation.update.handler.ts`,
  `orgEmail/mutation.update.handler.ts`, `organization/mutation.updateBasic.handler.ts`, and
  `service/mutation.upsert.handler.ts` — attribute edit would follow the same shape: fetch existing
  `{ textId, text, crowdinId }`, diff, call `syncDatabaseStringIfChanged`, then a plain
  `attributeSupplement.update`. It's only the two _attach_ (create) handlers
  (`organization/mutation.attachAttribute.handler.ts`,
  `service/mutation.attachServiceAttribute.handler.ts`) that are create-only today.
- **The create modal's pre-fill code is dead, not a head start**: `AttributeForm`'s `useEffect` in
  `packages/ui/modals/dataPortal/Attributes/index.tsx:172-195` looks like it tries to pre-fill from an
  existing value, but carries a `// @ts-expect-error to make work` comment and reads from a field
  (`selectedAttr.attributeSupplement`) that doesn't exist on the query it's fed by — this branch has
  never actually worked and can't be flipped on as-is.
- **The raw per-record values an edit form needs are already fetched, just discarded**:
  `packages/api/formatters/attributes.ts` (`formatAttributes.prismaSelect`) already selects
  `active, countryId, country, data, govDistId, govDist, languageId, language, text.tsKey.*, boolean`
  per row, and `query.forServiceEditDrawer.handler.ts` uses it — but
  `packages/ui/modals/Service/processors/*.ts` flattens this down to display-only `badgeProps`/
  `detailProps` strings before handing `wrapperProps` to `AttributeEditWrapper`, dropping the raw
  values at that boundary. They need threading through instead of being discarded.

### Concrete implementation steps

1. **Backend**: extend `ZAttributeEditWrapperSchema` with an `'update'` action + payload
   (`boolean`/`data`/`text`/`countryId`/`govDistId`/`languageId`), and add a branch to
   `mutation.AttributeEditWrapper.handler.ts` that fetches the existing row (incl. `textId`/
   `crowdinId`/`text`), calls `generateNestedFreeTextUpsert({ type: 'attSupp', freeTextId, ... })` +
   `syncDatabaseStringIfChanged` **outside** the transaction (same reasoning as the duplicate-service
   handler's comment about not holding an interactive transaction open across an external API call),
   then `attributeSupplement.update` inside it. Add `crowdinId` to `formatAttributes.prismaSelect` if a
   diff-aware resync is wanted (see [Open decisions](#open-decisions)).
2. **Data plumbing**: thread the raw per-record fields through `wrapperProps` from
   `processors/*.ts` into `AttributeEditWrapper`, since it currently only receives display strings.
3. **Frontend**: extract `AttributeForm` out of the create-only `AttributeModalBody`
   (`packages/ui/modals/dataPortal/Attributes/index.tsx:151-249`) so it can run pre-filled with real
   values, and wire `handleEdit` to open it instead of firing the `alert()`.
4. **Deliberately out of scope**: changing _which_ attribute/category a row points to mid-edit. Edit
   only changes the value; re-categorizing still means delete + re-create via the existing modal. The
   category/attribute pickers shouldn't even render in edit mode.

## Crowdin cleanup on delete

The plan discussed: **modify → overwrite the Crowdin string; delete → clean up the Crowdin string
too.** This is directionally correct, but today's delete path does neither — it's a bare
`prisma.attributeSupplement.delete()` with zero cleanup of any kind.

**No DB cascade does this automatically, and the cascade that exists only runs one direction.**
`AttributeSupplement.textId → FreeText` has `onDelete: Cascade` (`schema.prisma:828`,
confirmed at the DB level in the init migration), but that governs what happens to
`AttributeSupplement` when `FreeText` is deleted (parent→child) — not the reverse. Deleting
`AttributeSupplement` directly orphans the `FreeText` row, which orphans the `TranslationKey` row,
and Crowdin is never told anything happened.

A correct delete needs to, in order:

1. **Fetch first**: read `textId` → `FreeText.tsKey.{key, ns, crowdinId}` _before_ deleting anything —
   this data is gone once the delete happens, and `removeSingleKey` needs it.
2. Delete `AttributeSupplement`.
3. Delete `TranslationKey` (this cascades to delete `FreeText` for you — one fewer explicit delete) or
   delete both explicitly.
4. Call `removeSingleKey` (`packages/crowdin/common/apiFns.ts:166-168`) against Crowdin's API — no DB
   operation reaches the third-party string.
5. **Skip all of the above when `textId` is null** — attributes carrying only `boolean`/`data`/
   `countryId`/`languageId`/`govDistId` (no free text) need no Crowdin cleanup at all. A plain
   `textId !== null` check is sufficient to decide whether cleanup applies.

**This is genuinely new ground for the codebase, not a pattern to copy.** `removeSingleKey` has
exactly one existing call site (`service/mutation.duplicate.handler.ts:139-143`), and it's a
compensating rollback for a failed Crowdin _registration_ mid-duplicate — not a real user-initiated
"delete this and clean up" flow. A scan of every hard `.delete(` call under `packages/api/router`
turned up nothing else that hard-deletes a `FreeText`/`TranslationKey`-backed row at all (the others
are join-table deletes with no free text involved). Build and test this fresh, with the same
transaction/external-API-call timing care already documented in the duplicate-service handler.

**Checked and ruled out as risks:**

- **Shared `FreeText` rows across attributes** — not possible in practice. `AttributeSupplement.textId`
  is schema-enforced `@unique`, and every attribute (including copies made via the duplicate-service
  feature — `service/mutation.duplicate.handler.ts:108-135,262-278`) gets a freshly-generated
  `FreeText`/`TranslationKey` row, never a reused one. Deleting one attribute's Crowdin key can't
  orphan another attribute's translation.
- **Other tables referencing `FreeText`/`TranslationKey`** — the only other FK found in migration
  history (`AuditLog.freeTextId`) belongs to a table dropped years ago
  (`packages/db/prisma/migrations/20240201190323_drop_old_audit_log`); audit logging today goes
  through `getAuditedClient` (`packages/db/client/extensions/auditContext.ts`), a separate mechanism
  with no FK to `FreeText` at all. Nothing live blocks or complicates deleting these rows.

## Open decisions

1. **Diff-aware resync vs. always-overwrite for v1.** A fully diff-aware "only call Crowdin if the
   text actually changed" resync (matching `orgPhone`/`orgEmail`'s pattern) requires adding
   `crowdinId` to `formatAttributes.prismaSelect`, which it doesn't currently expose. A simpler v1
   could always overwrite the Crowdin string on save regardless of whether it changed, deferring the
   diff-aware version. Not decided here.
2. **Whether `update` and `delete`-with-cleanup ship together or separately.** They're independent
   gaps (one is a missing feature, the other is a missing cleanup step on an existing action) and
   could land as two smaller PRs instead of one.

## Related files

| Path                                                                                                                                                                                   | Purpose                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/ui/components/data-portal/ServiceEditDrawer/AttributeEditWrapper.tsx`                                                                                                        | Edit/Activate/Delete icons; `handleEdit` stub to replace                                                                                   |
| `packages/api/router/component/mutation.AttributeEditWrapper.schema.ts` / `.handler.ts`                                                                                                | Backend action dispatch; needs an `update` branch and delete-cleanup logic                                                                 |
| `packages/ui/modals/dataPortal/Attributes/index.tsx`                                                                                                                                   | Create-only `AttributeForm`/`AttributeModalBody` to extract for reuse in edit mode                                                         |
| `packages/ui/modals/dataPortal/Attributes/fields.tsx`                                                                                                                                  | Generic per-shape field dispatch (`Supplement.{Boolean,Text,Data,Language,Geo}`)                                                           |
| `packages/db/prisma/schema.prisma`                                                                                                                                                     | `AttributeSupplement`, `FreeText`, `TranslationKey`, `AttributeSupplementDataSchema` models                                                |
| `packages/db/lib/generateFreeText.ts`                                                                                                                                                  | `generateNestedFreeTextUpsert` — the update-in-place primitive for `attSupp`                                                               |
| `packages/crowdin/api/index.ts`                                                                                                                                                        | `syncDatabaseStringIfChanged` — diff-and-resync primitive                                                                                  |
| `packages/crowdin/common/apiFns.ts`                                                                                                                                                    | `removeSingleKey` — Crowdin string deletion, currently only used as duplicate-service rollback                                             |
| `packages/api/router/orgPhone/mutation.update.handler.ts`, `orgEmail/mutation.update.handler.ts`, `organization/mutation.updateBasic.handler.ts`, `service/mutation.upsert.handler.ts` | Existing update-and-resync precedent to model the new `update` action on                                                                   |
| `packages/api/router/service/mutation.duplicate.handler.ts`                                                                                                                            | Only existing `removeSingleKey` call site (rollback, not user-delete); also proof that copies get fresh `FreeText` rows, never shared ones |
| `packages/api/formatters/attributes.ts`                                                                                                                                                | `formatAttributes.prismaSelect` — already fetches per-record values; would need `crowdinId` added for diff-aware resync                    |
| `packages/ui/modals/Service/processors/*.ts`                                                                                                                                           | Where raw per-record attribute values currently get flattened into display-only strings, dropping what an edit form would need             |
| `docs/DataPortal/Organizations/field-descriptions.md`                                                                                                                                  | Where this bug was first surfaced, as a tooltip workaround note rather than a fix                                                          |
| `docs/DataPortal/Organizations/duplicate-service.md`                                                                                                                                   | Precedent for the free-text-as-three-rows copy pattern and the Crowdin-registration-outside-transaction reasoning                          |

---

_Last verified against code: 2026-09-07. Scoping only — no code written against this doc yet._
