# Crowdin Integration

This document summarizes how InReach integrates with Crowdin for managing translations.

---

## Overview

The InReach app uses **Crowdin** to manage translations for both static UI content and dynamic organization data (`org-data`).  

- **Static content**: Translations for common UI elements, landing pages, and attributes.
- **Dynamic content**: Translations for organization-specific data, generated from the database and synced to Crowdin.

Translations are stored in JSON files in `public/locales/<lang>`. For organization data, these are generated from the `TranslationKey` table in the database.

---

## Key Concepts

- **Namespaces (`ns`)**: Grouping of translation keys. For example, `org-data` contains organization-specific translations.
- **TranslationKey table**: Stores all keys (`key`) and associated text (`text`) along with optional Crowdin IDs.
- **OTA (Over-the-Air)**: Crowdin OTA integration is used to fetch the latest translations dynamically into the app.
- **Redis cache**: Caches translations for quick access at runtime.

---

## How It Works

1. **Export DB keys**: `generateTranslationKeys.ts` exports `TranslationKey` rows to JSON files.  
   - Filters keys by `ns` and `active` status.  
   - Handles interpolation for pluralization.  
   - Writes JSON files to `public/locales/en/<namespace>.json`.

2. **Push to Crowdin**: JSON files are uploaded to Crowdin for translation.

3. **OTA Fetch**: At runtime, the app fetches translations from Crowdin using the OTA client (`@weareinreach/crowdin/ota`).  
   - API route `/api/i18n/load` handles fetching translations.  
   - Dynamic org data is fetched per organization and cached in Redis.

4. **Cache**: Redis is used to store translation results for performance.  
   - Cache is invalidated when new Crowdin manifests are available.

---

## File Structure

```text
packages/crowdin/
├── api/          # Crowdin API wrappers
├── cache/        # Redis cache handlers
├── ota/          # Over-the-air (OTA) integration
│   ├── edge/     # Edge-specific OTA logic
└── index.ts
apps/app/src/pages/api/i18n/load.ts  # API route for fetching translations
scripts/generateTranslationKeys.ts   # Generates JSON files from DB keys
