# i18next / Internationalization

## Overview

InReach's translation system, built on `i18next` + `react-i18next` + `next-i18next` (Pages Router). Serves both static, developer-authored copy (English source files in this repo, translated via Crowdin) and dynamic, org-authored custom text (descriptions, custom labels) stored in the database and served under a namespace named after the org's own ID.

## How It Works

- **Config**: `apps/app/next-i18next.config.mjs` (main app), `packages/ui/next-i18next.config.js` + `packages/ui/.storybook/i18next.ts` (Storybook's separate standalone instance).
- **Backend chain** (browser only): `ChainedBackend` tries `CrowdinOTA` first, falls back to `LocalHTTP` (static files under `apps/app/public/locales/{{lng}}/{{ns}}.json`). Crowdin intentionally skips English — English is authored directly in the local JSON files and treated as source of truth.
- **Static namespaces**: `common`, `attribute`, `services`, `phone-type`, `user`, `user-title`, `country`, `gov-dist`, `org-data` (full list: `packages/db/generated/namespaces.ts`).
- **Dynamic per-org namespaces**: organization-authored text is served under a namespace literally named after the org's ID (e.g. `t(dbKey, { ns: orgId, defaultValue: dbText })`). The `LocalHTTP` backend's custom `request` override skips fetching these entirely when they can't resolve to a real static file (see the comment in `next-i18next.config.mjs`) rather than 404ing.
- **Custom formatter**: a `lowercase` format (`{{value, lowercase}}`) is registered via `services.formatter.add()` (i18next 26 removed the old `interpolation.format` callback option — see Known Issues). Registered in both `apps/app/next-i18next.config.mjs` and `packages/ui/.storybook/i18next.ts`. Not currently used by any static English string; could appear in org-authored (DB) content.
- **Pluralization**: `i18next-intervalplural-postprocessor`, registered as an i18next plugin. Keys follow `_one`/`_other`/`_interval` suffix conventions.

## Usage Patterns

Every distinct way this app renders translated content, for reference when writing unit/UI tests. Traffic tier = how often a real user hits this path.

### 1. Plain `t('key')`, no interpolation

The overwhelming majority of calls (e.g. `packages/ui/components/sections/Navbar.tsx`). Lowest risk pattern — no HTML parsing or variable substitution involved.

### 2. `t('key', { variable })` interpolation

| File                                                                          | Key                 | Locale string                                 | Traffic                                         |
| ----------------------------------------------------------------------------- | ------------------- | --------------------------------------------- | ----------------------------------------------- |
| `packages/ui/components/sections/Footer.tsx:145-147`                          | `inreach-copyright` | `"InReach, Inc. {{year}} • ..."`              | **High** (every page)                           |
| `apps/app/src/pages/index.tsx:98`, `org/[slug]/index.tsx:172`, `edit.tsx:160` | `page-title.base`   | `"{{- title}} - InReach"` (unescaped `{{-}}`) | **High** (`<title>` tag, every org/search page) |
| `apps/app/src/pages/admin/index.tsx:122`                                      | `welcome-name`      | `"Welcome, {{name}}!"`                        | Low (admin only)                                |
| `account/saved/index.tsx:124`, `[listId].tsx:163`                             | `list.updated`      | `"Updated {{date}}"`                          | Medium                                          |

### 3. `<Trans>` with nested HTML

26 total `<Trans>` call sites found. All of them supply an explicit `i18nKey`, which rules out the v17 `nodesToString` auto-generated-key change as a risk here (see Known Issues). The tag-wraps-a-variable shape below is still worth a QA pass on its own merits (interpolation correctness):

| File                                                                        | i18nKey                          | Locale string                                                                                                                                                              | Traffic                                     |
| --------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `packages/ui/components/data-display/AccessInfo.tsx:69`                     | `access.sms-with-body`           | `"Text <strong>{{body}}</strong> to {{code}}"`                                                                                                                             | Medium (org SMS contact)                    |
| `packages/ui/components/core/Breadcrumb.tsx:102-108`                        | `breadcrumb.back-to-dynamic`     | `"Back to <u>{{page}}</u>"` (`shouldUnescape`)                                                                                                                             | **High** (org/service breadcrumb nav)       |
| `packages/ui/components/sections/CrisisSupport/InternationalCard.tsx:51-56` | `crisis-support.who-this-serves` | `"<strong>Who this resource serves:</strong> {{targetPop}}"`                                                                                                               | Low/med                                     |
| `packages/ui/modals/LoginSignUp/index.tsx:219-238,284-303`                  | `agree-disclaimer`               | `"By clicking \"{{action}}\" you agree to InReach's <link1>Privacy Policy</link1> and <link2>Terms of Use</link2>."` — `values.action` is itself a nested `$t()` reference | **High** (every login/signup)               |
| `apps/app/src/pages/providers/index.tsx:94-99`                              | `cookie-consent.body`            | `<PrivacyLink>` wraps static text, not a variable                                                                                                                          | **High** (cookie banner, every new session) |

Bare `<strong>` (no named component) also appears in `common.json`: `alert-message-1`, `crisis-support.intl-stay-safe`, `crisis-support.natl-these-verified`, `lcr-error2`, `lcr-screen3`, `privacy-statement-body`.

Array-valued / multi-component Trans usage (lower priority, still worth a pass): `PrivacyStatement.tsx` (nested `<listGroup><listItem>`, `joinArrays:''`), `ClaimOrg.tsx`, `QuickPromotion.tsx`, `ResetPassword.tsx`, `AccountVerified.tsx`, `GenericContent.tsx`, `AlertMessage.tsx` / `LocationBasedAlertBanner`, homepage (`pages/index.tsx` — `CardTranslation`, cookie/banner/call-out copy), `Hero.tsx`, `SearchBox.tsx`, `Footer.tsx` tagline.

### 4. Pluralization (`_one`/`_other`/`_interval`)

| Key                                                 | File                                                                                       | Traffic                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------- |
| `count.result_one/_other`                           | `pages/search/intl/index.tsx:117`, `[country].tsx:141`, `search/[...params]/index.tsx:436` | **High** (search results) |
| `review_one/_other` + `review-count_interval`       | `components/core/Rating.tsx:47,55,63`                                                      | **High** (org cards)      |
| `photo_one/_other` + `photo_interval`               | `Photos.tsx:131`                                                                           | Medium                    |
| `view-x-result_one/_other`                          | `MoreFilter.tsx:497`, `ServiceFilter/index.tsx:395`, `SortResults.tsx:34`                  | Medium                    |
| `website_one/_other`, `count.more`                  | `ContactInfo/Websites.tsx`, `SavedOrgResultCard.tsx:107`                                   | Medium                    |
| `gov-dist.json` type-\* , `country.json` demonym_\* | various                                                                                    | Low                       |

### 5. URLs/links in translation strings

No raw `<a href>` or markdown-link syntax in any **static locale JSON** — those links all go through named `<Trans>` components with hrefs supplied in JSX (`link1`/`link2`, `PrivacyLink`, `LoginModal`, `Link`, etc.), a subset of §3 with no separate risk surface.

**DB-authored content is a different case.** `LocationBasedAlertBanner` (`packages/ui/components/core/LocationBasedAlertBanner/index.tsx:101-110`) and `AlertMessage` render `<Trans components={{ Link: <Link external ... /> }} />` where the code-side `Link` element has **no `href`** — the href is meant to come from inside the translated string itself, e.g. `<Link href="https://...">text</Link>` stored in the `TranslationKey` table (`ns: 'org-data'`, confirmed live: `locationBasedAlert.alrt_01J1D1GAT5G5S6QNMCND5PMDAX`, see `packages/db/prisma/data-migrations/2025-01-07_update-locationbased-alert-string.ts`). Verified against the installed react-i18next source (`TransWithoutContext.js`): `mapAST` parses attributes straight off the tag in the translated string, and `mergeProps` spreads them onto the matched `components` entry with the string's attributes taking precedence. This means a Crowdin translator can set a **different href per language** for the same link — by design, not a bug — but it also means the URL is content, not code, and nothing currently checks that a translator-edited href is valid. See Known Issues.

### 6. Namespace-scoped translations

- Multi-namespace: `pages/search/intl/index.tsx:91` & `[country].tsx:110` use `['services','common','attribute']` (**high traffic**); `dataPortal/Attributes/index.tsx`, `fields.tsx`; `dataPortal/PhoneEmail/fields.tsx`.
- **Dynamic per-org namespace** (`ns: orgId`): `ServicesInfo.tsx`, `ContactInfo/PhoneNumbers.tsx`, `ContactInfo/Websites.tsx`, `ContactInfo/Emails.tsx`, `CrisisSupport/NationalCard.tsx`, `InternationalCard.tsx`, `ListingBasicInfo.tsx`, `modals/Service/index.tsx`. Fires on **every** org/location/service detail page view.

### 7. Date/number Intl formatters

None found in any locale string — only the custom `lowercase` formatter exists (see How It Works), and it's currently unused by static content.

### 8. Other notable patterns

- **Nested `$t()` inside interpolation values**: `page-title.base` (`'$t(page-title.search-results)'`), `agree-disclaimer` (`'$t(words.sign-up)'`/`'$t(log-in)'`). Combines nested-key resolution _and_ Trans interpolation — worth its own test case.
- **`shouldUnescape={true}`** (`Breadcrumb.tsx`) and unescaped `{{- title}}` interpolation bypass default HTML-escaping — a distinct code path from normal escaped interpolation.
- **`defaults` prop with inline HTML** on generic Trans wrappers (`AlertMessage.tsx`, `Footer.tsx` tagline `<br/>`) — a second place HTML-tag parsing applies besides the JSON file.
- **Generic reusable Trans wrappers** (`RichTranslate` in `LoginSignUp/index.tsx`, `TransContent` in `GenericContent.tsx`, `AlertMessage.tsx`) — one component covers multiple distinct locale strings; test each call site, not just the component.

## Testing / Manual QA Checklist

No automated coverage exists yet for rendering correctness (see `docs/AppFeatures/testing-strategy.md` — TODO once that doc exists). Until unit/UI tests are built out, use this table as the manual regression checklist after any i18next-family dependency bump or config change.

| Page / flow                                                              | What to check                                                                                                        |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Any page footer                                                          | Copyright line year interpolates correctly                                                                           |
| Any org/search page browser tab                                          | `<title>` reads correctly — no literal `{{- title}}` or `$t(...)` leaking through                                    |
| First visit / new session                                                | Cookie consent banner — "Privacy Statement" renders as a working link                                                |
| Org/service detail pages                                                 | Breadcrumb "Back to **[page name]**" — styled correctly, not raw tags                                                |
| Login/signup forms                                                       | Privacy Policy / Terms of Use disclaimer — both links work, nested `$t()` action text resolves correctly             |
| Any org/location/service detail page                                     | Org-authored custom text renders (per-org namespace), not stuck on English fallback                                  |
| Search results pages                                                     | Result count and review count pluralization ("1 result" vs "N results")                                              |
| Privacy Statement modal                                                  | Nested list items render correctly                                                                                   |
| Password reset / account verification                                    | `<strong>`-wrapped and `<Switch>`/`<Link>`-nested copy renders correctly                                             |
| Crisis-support pages                                                     | `<strong>{{targetPop}}</strong>`-style interpolation                                                                 |
| Marketing homepage                                                       | Multi-component `CardTranslation` feature cards                                                                      |
| Any page, if org content looks oddly cased                               | Check whether the `lowercase` custom formatter is in play (org-authored content only)                                |
| Location-based alert banner (if one is configured for the test location) | Link renders and its href points somewhere sensible — can't be fully verified from real data alone, see Known Issues |

Automated-test equivalents worth building first (highest ROI given the traffic tiers above): a Storybook interaction test or snapshot for `Breadcrumb`, `LoginSignUp` disclaimer, `Footer`, and the cookie-consent banner; a unit test for the pluralization keys in `Rating.tsx` and search result counts; an integration test asserting a per-org namespace falls back to `defaultValue` correctly when no org translation exists; a **mock-data unit test** for the DB-authored attribute-passthrough case (§5 / Known Issues) — render `<Trans components={{ Link: <Link/> }}>` (no `href` on the component, matching `LocationBasedAlertBanner`/`AlertMessage`) against two mock translation strings with different `<Link href="...">` values and assert each renders its own string-supplied href, since real data currently can't exercise this reliably.

## Known Issues / Gotchas

- **`next-i18next@16` split the package into separate App Router and Pages Router builds.** The bare `next-i18next` import now resolves to the App Router build, which doesn't export `useTranslation`/`Trans`/`appWithTranslation` at all. This app is 100% Pages Router — always import from `next-i18next/pages` (and `next-i18next/pages/serverSideTranslations` for that helper), never the bare package name. Getting this wrong is loud, not silent (TypeScript errors immediately, and the app fails to render at all if somehow bypassed) — but it's an easy mistake to reintroduce in a new file via editor auto-import.
- **i18next 26 removed the `interpolation.format` callback option.** Custom formats are now registered via `i18nInstance.services.formatter.add(name, fn)`. Since next-i18next manages instance creation internally for both browser and server contexts, this is wired in via a `type: '3rdParty'` plugin module in the `use` array (see `next-i18next.config.mjs`), not a direct post-init call.
- **The `lowercase` custom formatter is currently unused** by any static English string. If it's ever exercised (likely only via org-authored Crowdin content), it hasn't been tested since the i18next 26 port.
- **react-i18next v17's `<Trans>` HTML-tag serialization change does not apply to this codebase.** The v17 changelog scopes the behavior change to auto-generated Trans keys (no explicit `i18nKey` supplied); every one of the 26 `<Trans>` call sites here, including the generic wrappers `RichTranslate` and `TransContent`, supplies an explicit `i18nKey`, so the `nodesToString` codepath the change affects is never invoked. Confirmed by reading both the changelog and the relevant source. No testing burden from the version bump itself.
- **DB-authored translation strings can carry a real HTML attribute (e.g. `href`) with a different value per language, by design** (see Usage Patterns §5). This is a content-governance risk, not one introduced by any dependency bump — a Crowdin translator editing that attribute can silently retarget a link — but it's untested, and only one live example currently exists (`locationBasedAlert.alrt_01J1D1GAT5G5S6QNMCND5PMDAX`). It can't be reliably covered by testing against real data alone, since that one DB record doesn't consistently carry the attribute (confirmed empty of `href` in the local dev DB snapshot as of this writing) — needs a mock-data unit test instead (see Testing checklist).

## Related Files

| Path                                  | Purpose                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/app/next-i18next.config.mjs`    | Main app i18next config, backend chain, custom formatter/plugin registration   |
| `packages/ui/next-i18next.config.js`  | Storybook-side config (locales/paths only)                                     |
| `packages/ui/.storybook/i18next.ts`   | Storybook's standalone i18next instance                                        |
| `apps/app/src/utils/i18n.ts`          | `serverSideTranslations` wrapper used by `getStaticProps`/`getServerSideProps` |
| `packages/db/generated/namespaces.ts` | Canonical static namespace list                                                |
| `apps/app/public/locales/en/*.json`   | English source translation files                                               |

---

_Last verified against code: 2026-08-16. If you change any file listed above, update this doc in the same PR and bump this date._
