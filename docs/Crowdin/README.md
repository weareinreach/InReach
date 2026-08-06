# Crowdin Integration

This document summarizes how InReach integrates with Crowdin for managing translations.

---

## Overview

The InReach app uses **Crowdin** to manage translations for both static UI content and dynamic organization data (`org-data`).

- **Static content**: Translations for common UI elements, landing pages, and attributes.
- **Dynamic content**: Translations for organization-specific data (org names, service names, access instructions, etc.), generated from the database and synced to Crowdin.

Translations are stored in JSON files in `public/locales/<lang>`. For organization data, source strings originate from the `TranslationKey` table in the database.

---

## Key Concepts

- **Namespaces (`ns`)**: Grouping of translation keys. For example, `org-data` contains organization-specific translations.
- **TranslationKey table**: Stores all keys (`key`) and associated text (`text`), along with an optional `crowdinId` linking back to the corresponding Crowdin string.
- **ID prefixes**: Every table in the app has a fixed prefix used when generating IDs (`generateId()`, in `packages/db/lib/idGen.ts`), e.g. `orgn_` for `Organization`, `osvc_` for `OrgService`, `oloc_` for `OrgLocation`. Translation keys for org data are built by concatenating these prefixed IDs, e.g. `orgn_<id>.osvc_<id>.name` — there is no separate prefixing step; the prefix comes from `generateId()` itself.
- **OTA (Over-the-Air)**: Crowdin OTA integration is used to fetch the latest translations dynamically into the app.
- **Redis cache**: Caches translations for quick access at runtime.

---

## How It Works

### 1. Every `org-data` TranslationKey is synced to Crowdin in real time, with context

Any mutation handler that writes a free-text field (org basics, phone, email, website, service name/description, access instructions, attribute supplements) follows the same convention: call `addSingleKey()` (or `updateSingleKey()`/`upsertSingleKey()` for edits) against Crowdin first — passing a `context` URL built by `buildContextUrl(slug, locationId?)` (`packages/crowdin/common/buildContextUrl.ts`) — stamp the returned Crowdin string ID onto the nested `tsKey.create` payload as `crowdinId`, then let Prisma create the `TranslationKey` row as part of that nested create. Confirmed call sites:

| Handler                                                                               | Field(s) synced in real time                               |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `service/mutation.createAccessInstructions.handler.ts`                                | access instructions                                        |
| `organization/mutation.updateBasic.handler.ts`                                        | org description                                            |
| `organization/mutation.createNewQuick.handler.ts`                                     | org description                                            |
| `organization/mutation.attachAttribute.handler.ts`                                    | attribute free text (org, service, **or location**-scoped) |
| `organization/mutation.createNewSuggestion_with_OrgService.handler.ts`                | new service names created alongside a suggested org        |
| `service/mutation.attachServiceAttribute.handler.ts`                                  | service attribute free text                                |
| `orgPhone/mutation.create.handler.ts`, `.upsert.handler.ts`, `.update.handler.ts`     | phone description                                          |
| `orgWebsite/mutation.create.handler.ts`, `.upsert.handler.ts`                         | website description                                        |
| `orgEmail/mutation.create.handler.ts`, `.update.handler.ts`, `.upsertMany.handler.ts` | email description                                          |
| `service/mutation.create.handler.ts`, `.upsert.handler.ts`                            | service name **and** description                           |

The last two in the table (`createNewSuggestion_with_OrgService`, `attachServiceAttribute`) used to be batch-only (no immediate Crowdin sync, no context) — they were converted to the same real-time-with-context convention as everything else. There is no longer a "batch-only" exception for `org-data` content.

A separate wrapper, `addSingleKeyFromNestedFreetextCreate` (`packages/crowdin/api/index.ts`), exists specifically to make this "sync first, then stamp `crowdinId` onto the nested create" pattern reusable for the `freeText.create.tsKey.create` shape, and now accepts an optional `context` second argument too.

This list of call sites is not guaranteed exhaustive going forward — any new mutation that adds a free-text field should follow this convention (sync + `context`), or it'll be an org-data string with no link back to the app until the next [context backfill](#4-context-backfill-packagesdbsynccrowdincontextts) run.

No `translationKey.upsert` calls exist in the codebase as of this writing — only `.create` (the `upsertSingleKey`/`upsertMany` names above refer to the _Crowdin-side_ API call or the parent model's Prisma upsert, not the `TranslationKey` row itself, which is always a plain nested `.create`).

**Not every location-relevant handler had a location ID to pass.** `orgPhone`/`orgEmail`'s `upsertMany` variant handles multiple locations per record (many-to-many), so there's no single unambiguous location to build a URL from — those fall back to the plain org-level URL rather than guessing. `OrgPhone`/`OrgEmail` also don't have a direct `Organization` relation (they connect via join models `OrganizationPhone`/`OrganizationEmail`) — don't add one when touching these handlers, it'll break the create/update call.

### 2. Real-time sync implementation (`packages/crowdin/common/apiFns.ts`)

`packages/crowdin/common/apiFns.ts` wraps the official `@crowdin/crowdin-api-client` and exposes:

- `addSingleKey`, `addMultipleKeys` — create new strings in Crowdin
- `updateSingleKey`, `updateMultipleKeys` — edit existing strings
- `upsertSingleKey` — looks up by key first (`getStringIdByKey`, via Crowdin's `scope: 'identifier'` filter), then updates or creates
- `getStringIdByKey` — resolves a `TranslationKey.key` to its Crowdin string ID when `crowdinId` isn't already stored

All of these accept an `isDatabaseString` flag, which determines which Crowdin project/branch the string is routed to (`projectId.dbContent` + `branches.database` vs. `projectId.base` + `branches.main`).

**Context field:** every function above accepts an optional `context?: string`, sent as part of the create payload (`addSingleKey`/`addMultipleKeys`) or as an additional `/context` patch op alongside the existing `/text` patch (`updateSingleKey`/`updateMultipleKeys`). Callers build that URL via `buildContextUrl(slug, locationId?)` (`packages/crowdin/common/buildContextUrl.ts`, re-exported from `@weareinreach/crowdin/api`) — `https://app.inreach.org/org/<slug>/<oloc_id>` when a location ID is given, otherwise the plain `https://app.inreach.org/org/<slug>`. This is the same URL-building logic as the context-backfill script (§4) — the two are kept manually in sync since `packages/crowdin` can't import from `packages/db` (see [Operational Notes](#packagesdb-and-packagescrowdin-have-a-one-way-dependency)).

### 3. Batch export (DB → JSON → Crowdin) — static content only

This pipeline is for the **static/base** namespaces (`attribute`, `common`, `services`, `landingPage`, etc.) — it does not apply to `org-data` content, which is entirely real-time now (§1).

1. **Export**: `apps/app/lib/generators/translationKeys.ts` (`generateTranslationKeys`) queries `TranslationNamespace` → `TranslationKey` from the DB and writes flat JSON files to `public/locales/en/<namespace>.json`. It filters by namespace/active status depending on `EXPORT_ALL` / `EXPORT_DB` env flags, and handles pluralization/interpolation.
   - This script has no visibility into `Organization`/`OrgService` records — it only reads what's already in `TranslationKey`. It cannot add context/slug data on its own.
2. **Push**: A GitHub Actions workflow (`.github/workflows/crowdin.yml`, triggers: push/PR-close/schedule/manual dispatch) runs `crowdin push sources`, uploading the generated JSON files to Crowdin via the Crowdin CLI.
3. **Pull**: The same workflow runs `crowdin pull` (on `dev` branch or schedule) to bring translated JSON files back into the repo, opening a PR with the changes.

### 4. Context backfill (`packages/db/lib/syncCrowdinContext.ts`)

Now that creation-time context is live (§1-2), this script's job is narrower: backfill context for `org-data` strings that were created **before** this change, plus act as a safety net for any future call site that doesn't follow the real-time convention. It no longer needs to run routinely.

A standalone, additive script (does not modify any `apiFns.ts` function or mutation handler). It lives in `packages/db` rather than `packages/crowdin` because it needs both Prisma and the Crowdin API client, and `packages/db` already depends on `@weareinreach/crowdin` — the reverse dependency would create a cycle.

- Fetches every string in the `org-data` database branch.
- Parses the leading `orgn_<id>` segment out of each string's `identifier`, and a `oloc_<id>` segment if present anywhere in it.
- Looks up that organization's `slug` and sets `context` to:
  - `https://app.inreach.org/org/<slug>/<oloc_id>` when the identifier includes a location ID, or
  - `https://app.inreach.org/org/<slug>` otherwise (this covers plain org-level keys and service-scoped (`osvc_`) keys alike, since services don't have their own page/anchor in the app).
- Skips strings that already have a real (non-auto-generated) context, unless run with `--force`. Supports `--dry-run`.
- Before writing anything for real, backs up every changed string's previous `context` value to a timestamped JSON file under `packages/db/crowdin-backups/` (gitignored). `--revert <path>` replays a backup file to restore the old values (also supports `--dry-run` to preview the revert).

**Manual only — there is no scheduled job for this.** Run it by hand whenever it's needed (e.g. after a bulk data change, or as a periodic sanity check); it does not run in CI or on any schedule.

**Setup, before running:** the repo-root `.env` (not `packages/db/.env` — see the gotcha below) needs:

- `CROWDIN_TOKEN` — a Crowdin personal access token with access to the project.
- `DATABASE_URL` — pointed at **production**. The script resolves org slugs by querying whatever database `DATABASE_URL` points at, and that has to match the database the live Crowdin strings were actually generated from, or slugs will be wrong or spuriously reported as missing (see the empirical local-vs-production comparison below). Prefer the inline-override form shown further down over editing the root `.env` directly, so you don't leave a production connection string sitting in a file every other `pnpm db:*` script also reads.

Run via `pnpm --filter @weareinreach/db crowdin:sync-context` (add `-- --dry-run` / `-- --force` / `-- --sample-skipped` / `-- --revert <path>` as needed). Always do a `--dry-run` first.

**Detecting Crowdin's auto-generated fallback is trickier than it looks.** Crowdin doesn't leave `context` empty for a string that's never had one set — it populates it with the identifier-breadcrumb fallback text, and in practice that fallback is **two lines**: the raw identifier, then the arrow-breadcrumb form, joined by `\n` (e.g. `"orgn_xxx.osvc_xxx.name\norgn_xxx -> osvc_xxx -> name"`). An early version of `isAutoGeneratedContext` only checked for _one_ of those two forms and treated the combined two-line value as "real, custom context" — which meant it silently skipped ~89% of all strings, all of which were actually still on the auto-generated fallback. The fix: check that _every line_ of the context matches one of the two known forms. If you're ever touching this function again, verify against real sample data (`--sample-skipped`) before trusting a "skipped, has real context" count — a plausible-looking count is not the same as a correct one.

**Verified baseline (production, as of this writing, before the creation-time change in §1 went live):** ~69,634 strings in the branch, 0 with genuinely real/custom context (i.e., Crowdin had never had real context set on anything in this branch), and 32 with no matching organization — of which 30 are for organizations that have been fully deleted from the production database (not soft-deleted, just gone — their Crowdin strings were never cleaned up when the org was removed) and 2 are `locationBasedAlert.alrt_<id>` keys, a different, non-org-scoped key format that happens to live in the same branch. None of that 32 indicates a bug in the matching logic — if a future run finds a very different "no matching org" count, that's worth investigating, but 32-ish orphaned/non-org strings is the known-expected baseline, not a red flag. Going forward, any _new_ strings should already arrive with context from §1, so a re-run should mostly show the already-covered historical set plus this same small orphaned tail.

**This script's correctness depends entirely on which database it's pointed at.** It resolves org slugs by querying whatever `DATABASE_URL` is active, and that URL must reflect the same org data the live Crowdin strings were generated from (i.e., production) or the slugs it writes will be wrong or spuriously missing. Confirmed empirically: the same dry-run against a local dev database reported 469 "no matching org" strings; against production, that dropped to 32 (see above) — the local database was simply missing/diverging on hundreds of orgs that exist in production. See [Local vs. production database](#local-vs-production-database-gotchas) below before running this for anything other than a local sanity check.

---

## File Structure

```text
packages/crowdin/
├── api/
│   ├── edge.ts         # Edge-safe subset of the API wrappers
│   └── index.ts        # Re-exports common/apiFns + buildContextUrl; also defines addSingleKeyFromNestedFreetextCreate
├── cache/
│   └── index.ts        # Redis (Vercel KV) cache read/write for OTA content
├── common/
│   ├── apiFns.ts            # addSingleKey, updateSingleKey, upsertSingleKey, getStringIdByKey, etc.
│   ├── buildContextUrl.ts   # Shared URL-building logic used by every real-time-sync call site
│   └── otaFns.ts
├── ota/
│   ├── edge.ts          # Edge-safe OTA fetch
│   └── index.ts
├── constants.ts         # projectId, branches
├── package.json
└── tsconfig.json

packages/db/lib/syncCrowdinContext.ts        # Context backfill script (see "Context backfill" above)
apps/app/lib/generators/translationKeys.ts   # Batch export: DB -> public/locales/en/<ns>.json (static content only)
apps/app/src/pages/api/i18n/load.ts          # Runtime fetch API route (OTA)
```

Note: `packages/crowdin/package.json` declares `"main"`/`"types": "./index.ts"`, but no `packages/crowdin/index.ts` file currently exists — a pre-existing dangling reference, unrelated to this doc.

---

## Operational Notes / Gotchas

Things that cost real time to figure out while building this feature — captured so the next person doesn't have to re-derive them.

### `packages/db` and `packages/crowdin` have a one-way dependency

`packages/db` depends on `@weareinreach/crowdin` (`packages/db/package.json`), not the other way around. If you ever need code in `packages/crowdin` to touch the database, **don't add `@weareinreach/db` as a dependency of `packages/crowdin`** — that creates a cycle, which breaks `pnpm install`'s `postinstall` step outright (`turbo`'s task graph refuses to build with a cyclic dependency). Instead, put that code in `packages/db` and import `@weareinreach/crowdin`'s public exports (e.g. `@weareinreach/crowdin/api`) from there — that's why `syncCrowdinContext.ts` lives in `packages/db/lib/`, not `packages/crowdin/api/`. It's also why `buildContextUrl` is duplicated logic (once in `packages/crowdin/common/buildContextUrl.ts` for the real-time path, once inline in `syncCrowdinContext.ts` for the backfill path) rather than a single shared implementation — keep both in sync by hand if the URL format ever changes.

### Some models don't have a direct `Organization` relation - check `schema.prisma` before assuming

`OrgWebsite` and `OrgService` have a direct `organizationId`/`organization` relation. `OrgPhone` and `OrgEmail` do **not** — they connect to orgs only through join models (`OrganizationPhone`, `OrganizationEmail`). Adding `organization: { connect: ... }` directly to an `OrgPhone`/`OrgEmail` create/update call is a type error (caught by `tsc`, but check the schema first rather than relying on that). `AttributeSupplement` has direct `organizationId`/`locationId`/`serviceId` scalars.

### `~xxx/*` path aliases work fine in scripts run via bare `tsx`

`tsx` (unlike bare `ts-node`) resolves each package's `tsconfig.json` `paths` automatically, with no extra config, flags, or `tsconfig-paths` registration needed — confirmed by `packages/db/prisma/dataMigrationRunner.ts`, which imports `~db/client` etc. directly and is run via `pnpm with-env tsx ./prisma/dataMigrationRunner.ts`. So a standalone script like `syncCrowdinContext.ts` can freely use `~db/client` instead of a fragile relative path, even though it's never bundled by webpack/Next.js.

### Local vs. production database gotchas

- **`packages/db/package.json`'s `with-env` script is hardcoded to `dotenv -e ../../.env --`** — it _always_ loads the **repo-root** `.env`, regardless of your current working directory. It never reads `packages/db/.env` (a separate file that exists only for Prisma CLI's own auto-loading when you run `prisma` commands directly, bypassing `pnpm with-env` — unrelated to any `pnpm db:*`/`crowdin:sync-context` script). Putting `DATABASE_URL` or `CROWDIN_TOKEN` in `packages/db/.env` has no effect on this script.
- **To point this script at a different database than your local one (e.g., production, for a real run) without risking every other `pnpm db:*` script**, override the env var inline for that one invocation instead of editing the shared root `.env`:
  ```bash
  DATABASE_URL="<connection string>" pnpm --filter @weareinreach/db exec tsx lib/syncCrowdinContext.ts -- --dry-run
  ```
  `dotenv` does not override a variable that's already set in the environment, so the inline value wins. If you do edit the root `.env` directly instead, remember to revert it immediately after — every `db:migrate`/`db:reset`/etc. script reads that same file, and a stale production connection string sitting there is a real footgun.
- **GitHub Actions secrets and Vercel environment variables are two completely separate stores with no automatic sync.** This script only ever runs locally/manually, so it doesn't consume a GitHub secret itself - but if you're ever tempted to wire it into a workflow, know that `secrets.DATABASE_URL` (used by a couple of this repo's other workflows) matching Vercel's production value today is only because someone manually set both to the same thing. There's no live link, and no GitHub Environment scoping exists anywhere in this repo's workflows to enforce which secret is "production." Don't assume the two are in sync without checking.

### Confirming you're looking at the right branch in Crowdin's UI

The keys in `packages/crowdin/constants.ts`'s `branches` object (`main`, `dev`, `database`, `database-draft`) are our own internal aliases for numeric Crowdin branch IDs — they are **not guaranteed to match whatever Crowdin's UI displays as that branch's name**. When comparing a count from this script against what you see in the Crowdin dashboard, don't trust the branch label shown in the UI; check the actual numeric ID instead (visible in the editor URL, e.g. `https://inreach.crowdin.com/editor/{projectId}/{branchOrFileId}/{lang}` — the `{branchOrFileId}` segment) and compare it against the value of `branches.database` (currently `5412`) in code. Also note that Crowdin's "Strings" list view and branch-level summary counts can be scoped differently (one file vs. the whole branch), so a mismatch between two different UI screens doesn't necessarily mean either one is wrong.

---

## Known Gaps / Open Questions

1. **No location-scoped (`oloc_`) translation keys exist yet.** `OrgLocation` create/update handlers don't create any `TranslationKey` rows today — there's no existing free-text field on a location that's synced to Crowdin. If/when one is added, its key format will need to be designed from scratch (there's no existing precedent to match), but both the real-time path (`buildContextUrl`) and the context-backfill script already know how to build the right URL for it once the `oloc_<id>` segment appears in a key.
2. **Exhaustiveness of write paths.** The real-time-sync handlers listed in §1 were found by searching for the `tsKey.create` + `crowdinId`-stamping pattern; this is believed to be complete as of this writing but should be re-verified if this doc is revisited, since new mutations could introduce additional call sites without following the existing convention.
3. **`upsertMany` handlers (orgEmail, and any future ones) don't pass a location ID** even when the record is linked to one or more locations, since the relation is many-to-many and there's no single unambiguous choice. These fall back to the org-level URL. Not incorrect, just less specific than it could be.
