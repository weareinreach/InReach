# Organization "Creator Had Data Portal Access" Flag

This document explains how `Organization.creatorHadDpAccess` is determined and what it's for.

## Purpose

`source: 'suggestion'` alone only tells you an org came through the public suggestion form — it
doesn't tell you whether the _submitter_ was a member of the public. Interns and volunteers have no
way to add orgs except that same public form, and they hold real Data Portal permissions without
necessarily having an `@inreach.org` email, so email domain isn't a usable signal. This field answers
the actual question: **did the person who submitted this org have Data Portal access at the time?**

Used by the Organizations table's "Create Method" toolbar filter
(see [`docs/DataPortal/Organizations/README.md`](../DataPortal/Organizations/README.md)) to distinguish:

- **Public** — `source.source === 'suggestion'` AND `creatorHadDpAccess === false`
- **Internal** — `source.source === 'suggestion'` AND `creatorHadDpAccess === true`, OR
  `source.source === 'data-portal'` (both mean "not actually the public")

## Relevant Models

### Organization

- `sourceId` → `Source` (`source.source` — `'suggestion'`, `'data-portal'`, `'migration'`, `'spreadsheet upload'`)
- `creatorHadDpAccess: Boolean?` — the field this doc covers

### AssignedRole / UserRole / RolePermission / Permission

- Role-derived permission path: `User.roles` → `AssignedRole.role` → `UserRole.permissions` →
  `RolePermission.permission` → `Permission.name`

### UserPermission / Permission

- Direct-grant permission path: `User.permissions` → `UserPermission.permission` → `Permission.name`

### AuditTrail

- `table`, `operation`, `recordId` (`text[]` of the row's PK), `actorId`, `timestamp` — used only for
  the historical backfill (see below), not at write time.

---

## Logic

- **Definition:** `creatorHadDpAccess` is `true` if the user who submitted the org held any of
  `dataPortalBasic`, `dataPortalManager`, `dataPortalAdmin`, `root`, `sysadmin`, or `system` at the
  moment of submission — via **either** the role-derived path or the direct-grant path, unioned, with
  no `authorized`/`active` filtering. This exactly mirrors the permission check
  `packages/auth/lib/genUserSession.ts` uses to gate real Data Portal login access.
- **Implementation:** Computed once in `packages/api/router/organization/lib/createOrgSuggestion.ts`
  (`hasDataPortalAccess(prisma, userId)`) before the create transaction, and stored on the new
  `Organization` row — **not** recomputed on later reads. This is deliberate: a person's access
  changes as they rotate on/off the team, so "what they had at submission time" is the only
  meaningful answer, and a dynamically-recomputed value would silently change out from under a
  historical record.
- **Result:**
  - `true` → creator had Data Portal access at submission time (staff/volunteer via the public form,
    or anyone using the Data Portal's own Add Org modal)
  - `false` → creator had no Data Portal access (a genuine public submission)
  - `NULL` → predates this field, or not applicable to this org's source

---

## Notes / Caveats

- Only meaningfully set for `source.source IN ('suggestion', 'data-portal')`. It's `NULL` for
  `'migration'` and `'spreadsheet upload'` sources — there's no "creator" concept for those.
- Nullable with no default — a migration backfilling every existing row to `false` would incorrectly
  claim every pre-existing org was a genuine public submission. `NULL` means "unknown," not "public."

---

## Historical Backfill

Existing orgs predate this field and started `NULL`. Backfilled via
[`docs/Database/SQLScripts/backfill-organization-creator-had-dp-access.sql`](SQLScripts/backfill-organization-creator-had-dp-access.sql),
which recovers each org's creator from `AuditTrail` (`INSERT` row where `recordId @> ARRAY[org.id]`)
and checks that user's **current** permissions via the same two-path union above — a best-effort
proxy, since permission grants/revokes aren't themselves timestamped anywhere in this schema, so the
org's original creation-time access can't be perfectly reconstructed.

Two cases are deliberately left `NULL` rather than guessed at:

1. **No audit row at all** — the audit trigger was only attached to `Organization` starting migration
   `20230901160641_enable_audit_logging_on_tables`; anything created before that has nothing to recover
   a creator from.
2. **Resolves to the `inreach_svc@inreach.org` service account** — the audit trigger's fallback actor
   whenever `app.actor_id` wasn't set for a given write (e.g. writes made before `getAuditedClient`
   existed, or a direct/raw write). A match there doesn't mean "we know who did this."

Script is safe to re-run — it only ever updates rows where `creatorHadDpAccess IS NULL`.

As run against the local/dev database (2026-08-31): of 1,403 pre-existing `suggestion` rows, 351
resolved to `false` (Public), 633 to `true` (Internal), 419 remain `NULL` (104 predate the audit
trigger, 315 resolved to the service account). All 5 pre-existing `data-portal` rows resolved to `true`.

## Query to inspect the current breakdown

```sql
SELECT s.source, o."creatorHadDpAccess", count(*)
FROM "Organization" o
JOIN "Source" s ON s.id = o."sourceId"
GROUP BY s.source, o."creatorHadDpAccess"
ORDER BY s.source, o."creatorHadDpAccess";
```
