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
- **ID prefixes**: Every table in the app has a fixed prefix used when generating IDs (`generateId()`, in the ID-generation lib), e.g. `orgn_` for `Organization`, `osvc_` for `OrgService`. Translation keys for org data are built by concatenating these prefixed IDs, e.g. `orgn_<id>.osvc_<id>.name` — there is no separate prefixing step; the prefix comes from `generateId()` itself.
- **OTA (Over-the-Air)**: Crowdin OTA integration is used to fetch the latest translations dynamically into the app.
- **Redis cache**: Caches translations for quick access at runtime.

---

## How It Works

### 1. Two paths write `TranslationKey` rows

Not all `TranslationKey` rows are created the same way. There are (at least) three known call sites, with two different sync behaviors:

| Handler                                                   | Creates `TranslationKey`?                             | Syncs to Crowdin immediately?                                                                        |
| --------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `mutation.createNewSuggestion_with_OrgService.handler.ts` | Yes (one per service, via `generateId('orgService')`) | No — batch only                                                                                      |
| `mutation.attachServiceAttribute.handler.ts`              | Yes (passed-in translationKey object)                 | No — batch only                                                                                      |
| `mutation.createAccessInstructions.handler.ts`            | Yes                                                   | **Yes** — calls `addSingleKey()` and stores the returned Crowdin string ID as `crowdinId` on the row |

A fourth entry point, `addSingleKeyFromNestedFreetextCreate` (`packages/crowdin/api`), wraps `addSingleKey()` for a specific Prisma nested-create pattern (`freeText.create.tsKey.create`) and should be treated as part of the same real-time sync path.

No `translationKey.upsert` calls exist in the codebase as of this writing — only `.create`.

### 2. Real-time sync (`addSingleKey` / `packages/crowdin/api`)

`packages/crowdin/common/apiFns.ts` wraps the official `@crowdin/crowdin-api-client` and exposes:

- `addSingleKey`, `addMultipleKeys` — create new strings in Crowdin
- `updateSingleKey`, `updateMultipleKeys` — edit existing strings
- `upsertSingleKey` — looks up by key first (`getStringIdByKey`, via Crowdin's `scope: 'identifier'` filter), then updates or creates
- `getStringIdByKey` — resolves a `TranslationKey.key` to its Crowdin string ID when `crowdinId` isn't already stored

All of these accept an `isDatabaseString` flag, which determines which Crowdin project/branch the string is routed to (`projectId.dbContent` + `branches.database` vs. `projectId.base` + `branches.main`).

**Known gap:** none of these functions currently send Crowdin's `context` field. Only `identifier` (the key) and `text` are ever passed in the request payload. This means the CONTEXT panel in the Crowdin editor only ever shows the raw key string — there is currently no way for a translator to see a link back to the live org/service the string belongs to, even though Crowdin's API supports it.

### 3. Batch export (DB → JSON → Crowdin)

For `TranslationKey` rows that aren't synced immediately (i.e., most of them):

1. **Export**: `lib/generators/translationKeys.ts` (`generateTranslationKeys`) queries `TranslationNamespace` → `TranslationKey` from the DB and writes flat JSON files to `public/locales/en/<namespace>.json`. It filters by namespace/active status depending on `EXPORT_ALL` / `EXPORT_DB` env flags, and handles pluralization/interpolation.
   - Note: this file lives at `lib/generators/translationKeys.ts`, **not** `scripts/generateTranslationKeys.ts`.
   - This script has no visibility into `Organization`/`OrgService` records — it only reads what's already in `TranslationKey`. It cannot add context/slug data on its own; that data isn't in scope here.
2. **Push**: A scheduled/triggered GitHub Actions workflow (`Crowdin Action`, runs on push/PR-close/schedule/manual dispatch) runs `crowdin push sources`, uploading the generated JSON files to Crowdin via the Crowdin CLI.
3. **Pull**: The same workflow runs `crowdin pull` (on `dev` branch or schedule) to bring translated JSON files back into the repo, opening a PR with the changes.

### 4. Runtime fetch

- `apps/app/src/pages/api/i18n/load.ts` — API route that fetches translations via Crowdin's OTA client (`@weareinreach/crowdin/ota`).
- Dynamic org data is fetched per-organization and cached in **Redis** for performance; cache is invalidated when new Crowdin manifests are published.

---

## File Structure

```text
packages/crowdin/
├── api/          # Crowdin API wrappers (addSingleKey, updateSingleKey, upsertSingleKey, etc.)
│   └── common/apiFns.ts   # Actual implementation; index.ts re-exports these
├── cache/        # Redis cache handlers
├── ota/          # Over-the-air (OTA) integration
│   ├── edge/     # Edge-specific OTA logic
└── index.ts

lib/generators/translationKeys.ts   # Generates public/locales/en/<ns>.json from the DB (batch export)

apps/app/src/pages/api/i18n/load.ts  # API route for fetching translations at runtime
```

---

## Known Gaps / Open Questions

1. **No context/URL support in Crowdin sync.** Translators currently only see a string's raw key (e.g., `orgn_01GVH3V92WRQC2VFANN0M43X71.osvc_....name`) in the Crowdin editor's CONTEXT panel — with no link to view the corresponding organization/service live in the app. Fixing this requires:
   - Adding a `context` (or similar) field to `apiFns.ts`'s request payloads (`addSingleKey`, `addMultipleKeys`), and
   - Passing a value for it from each call site — e.g., in `createNewSuggestion_with_OrgService.handler.ts`, `orgSlug`/`newOrganization.slug` is already in scope at the point `TranslationKey` rows are created and could be used to build a URL such as `https://app.inreach.org/org/<slug>`.
   - The batch export path (`translationKeys.ts`) has no access to org/service metadata and would need a separate mechanism (e.g., a follow-up script using the Crowdin API directly, keyed by `crowdinId` or the `orgn_`/`osvc_` IDs in the key) if context needs to be backfilled for existing/batch-synced strings.
2. **Exhaustiveness of write paths.** Three handlers are confirmed to create `TranslationKey` rows. This list may not be exhaustive if other creation paths exist outside of tRPC mutation handlers (e.g., seed scripts, admin tooling, raw SQL).
