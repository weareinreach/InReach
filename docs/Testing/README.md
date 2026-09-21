# Automated Testing

## Overview

Three real, growing test suites: Vitest for unit/component tests (`packages/ui`), Vitest for
backend handler/permission-gating tests (`packages/api` - a separate, deliberately minimal
suite with its own `vitest.config.mts`, no DB test container or fixtures yet - see
`lib/middleware/permissions.test.ts`), and Playwright for end-to-end browser tests
(`apps/app`). All three started from an empty/unused scaffold. This doc describes what exists
as of the date below, and (in [Test Automation Plan](#test-automation-plan)) the direction the
suite is growing in next - that section is forward-looking, everything above it is real and in
the repo today.

Growth so far has come from real bug fixes touching each area (most recently, the org/location
phone-number CRUD bugs - see `#2055`/`#2056`/`#2057`) rather than a separate up-front coverage
push, and that pattern - add coverage where you're already fixing something real - should
continue. The one deliberate change starting now: e2e coverage needs to grow proactively for
the app's two structurally different surfaces (public search/view vs. authenticated data-entry),
not only reactively when a bug is found - see the Plan section.

## Quick Reference

### Recommended: the test dashboard

1. **Start it**: `pnpm test:dashboard` - starts a local server at `http://localhost:4500` and
   opens it. (Runs from anywhere in the repo.)
2. **Click Run** on whichever row(s) you want - each spawns that suite for real (server-side,
   not just a copy-pasteable command) and shows a live status: running… → passed ✓ / failed ✗.
3. **Click Results or Coverage** on that row once it's done - opens that row's own report in a
   new tab.

The page is organized by **feature area** rather than by package (since `packages/api` is
entirely data-portal backend logic, and `packages/ui` mixes general components with
data-portal-specific ones - see `lib/testDashboard.ts` for exactly how each row is split):

- **General** - UI components that are neither search- nor data-portal-specific (`Rating`,
  `ReportSubmit`, `UserReviewSubmit`, `SuggestOrg`, `CreateNewList`)
- **View / Search** - currently Playwright e2e only; no component-level tests exist yet for
  `SearchBox`/`SearchResultCard`/etc. (see the search inventory doc)
- **Edit / Data-Portal** - three rows: `packages/ui`'s data-portal-specific components,
  `packages/api`'s entire suite (all of it - not "some"), and the `tests/crud` Playwright suite
  (currently empty, so this row will show a failed run with "No tests found" until the auth
  fixture exists - that's accurate, not a bug in the dashboard)

Each row writes to its own isolated report directory - `packages/ui/reports/<row>/{results,coverage}`
via Vitest's `--outputFile.html`/`--coverage.reportsDirectory` flags, `apps/app/reports/<row>/results`
via Playwright's `PLAYWRIGHT_HTML_REPORT` env var - so running one row never overwrites another's
results, unlike the shared `packages/{ui,api}/html`+`coverage` folders `pnpm test:report` (below)
writes to. The dashboard doesn't cover Storybook/Chromatic (see the tool table below) - there's
nothing to trigger locally for that one, it runs in CI against every push.

**Two gotchas already caught and fixed here, worth knowing before touching `lib/testDashboard.ts`
again:**

- **`PLAYWRIGHT_HTML_REPORT` is relative to the spawned process's `cwd`, not the repo root.**
  Each Playwright row spawns with `cwd: apps/app` already set, so its env var value must be
  `reports/<row>/results` (relative to `apps/app`) - **not** `apps/app/reports/<row>/results`.
  Getting this wrong doesn't error; it silently writes to a doubled `apps/app/apps/app/...`
  path, so the row's status shows "passed" while its Results link 404s. If you add a new
  Playwright row, double-check this the same way it was caught: trigger the row, then confirm
  the file actually landed where the server's `results` field expects it, not just that the
  run exited 0.
- **The dashboard's `fetch()` calls need `cache: 'no-store'` (client-side) and the server needs
  matching `Cache-Control: no-store` response headers**, on both `/run/*` and `/status/*`.
  Without them, clicking Run a second time can leave the status text stuck on the previous
  run's result instead of flipping to "running…" - the server-side state is correct the whole
  time (verified by curling `/status/<id>` immediately after a second `POST /run/<id>`), it's
  purely a browser-caching artifact of the polling `fetch()` calls. Both directions are now
  covered here (`renderPage()`'s `<script>` block, and the `/run`/`/status` route handlers) -
  if you add a new polling endpoint, carry this forward too.

### Command line (scripting, CI, or if you just prefer it)

Four separate testing tools live in this repo, checking four different things - not the same
thing four times:

| Tool                                | Checks                                              | Run                                             | Results                                                                                                                           |
| ----------------------------------- | --------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Vitest - `packages/ui`              | UI components behave correctly in isolation         | `pnpm test`                                     | terminal, or `pnpm test:report` for HTML (below)                                                                                  |
| Vitest - `packages/api`             | Backend handlers/permission checks behave correctly | `pnpm test` (same command runs both)            | terminal, or `pnpm test:report` for HTML                                                                                          |
| Playwright - `apps/app`             | The whole app works in a real browser, end to end   | `pnpm test:e2e`                                 | `apps/app/playwright-report/index.html`                                                                                           |
| Storybook/Chromatic - `packages/ui` | A component's visual appearance hasn't regressed    | `pnpm dev` (in `packages/ui`) to browse locally | Chromatic's hosted dashboard - **no local report file for this one**, that's inherent to how it works (see the CI Chromatic step) |

All commands below run from anywhere in the repo (root-level `pnpm` scripts via `turbo.json`

- see [How It Works](#how-it-works) for the equivalent per-package commands and the
  `--filter` gotcha behind them).

**Run the tests:**

1. `pnpm test` - both Vitest suites in one command (`packages/ui` unit/component tests +
   `packages/api` handler/permission tests)
2. `pnpm test:e2e` - full Playwright suite (`apps/app`, both `tests/search/` and `tests/crud/`)
3. `pnpm test:e2e:search` - just the search/view e2e suite
4. `pnpm test:e2e:crud` - just the CRUD/edit e2e suite (currently empty - see the Plan section)
5. `pnpm test && pnpm test:e2e` - everything, one after another

**See the test report and code coverage together, for both Vitest suites (one run produces
both, no need to run the suite twice):**

1. `pnpm test:report` - runs both Vitest suites once each, with the HTML test-reporter and
   coverage instrumentation both enabled in that same run. Produces four files:
   `packages/ui/html/index.html`, `packages/ui/coverage/index.html`,
   `packages/api/html/index.html`, `packages/api/coverage/index.html`. The two `coverage/`
   pages open directly (`open packages/ui/coverage/index.html`) - no server needed, they're
   plain HTML. The two `html/` (test-results) pages need a server to view (see next).
2. `pnpm test:report:view` - same as above, plus serves the test-report folders locally so
   they open in a browser automatically. (The `coverage/` pages still need opening manually,
   per above - `test:report:view` only auto-serves the test-results half.)
3. Coverage number without any browser tab: `pnpm test:coverage` - coverage only, printed to
   the terminal as well as written to `packages/{ui,api}/coverage/index.html`.

**Playwright is separate** - it doesn't produce a coverage report (JS coverage of a real
browser session isn't part of this setup):

1. Run any `pnpm test:e2e*` command first - writes the report to
   `apps/app/playwright-report/index.html`
2. `npx playwright show-report` - opens it with per-test detail and, for failures, a trace
   viewer plus a DOM snapshot at the moment of failure
   (`apps/app/test-results/<test-name>/error-context.md`)
3. Or skip the static report and watch tests run live instead: `pnpm test:e2e:ui`

## How It Works

- **Running tests, from anywhere in the repo**: every command in [Quick Reference](#quick-reference)
  also has a root-level equivalent via `turbo.json` (`pnpm test`, `pnpm test:watch`,
  `pnpm test:coverage`, `pnpm test:report`, `pnpm test:report:view`, `pnpm test:e2e`,
  `pnpm test:e2e:ui`, `pnpm test:e2e:search`, `pnpm test:e2e:crud`) - same names, just
  runnable without `cd`-ing into `packages/ui`, `packages/api`, or `apps/app` first (or from
  inside any of those directories, via `pnpm -w <script>` instead of `cd`-ing back to root).
  `pnpm test`/`test:watch`/`test:coverage`/`test:report*` run unfiltered, so Turbo picks up
  every package that defines a matching script (currently `packages/ui` and `packages/api`
  both do) automatically - no `--filter` needed, and no change required here if a third
  package adds its own `test` script later. The `test:e2e*` ones are `apps/app`-specific, so
  they do need `--filter=@weareinreach/app` - note the _full_ package name; `--filter=app`
  looks like it should work but silently matches nothing, since `apps/app`'s actual package
  name is `@weareinreach/app`. (The pre-existing `dev:app`/`dev:ui`/`dev:web` root scripts have
  this same bug and were not fixed here since it's outside this doc's scope.)
- **Unit/component tests**: `packages/ui/vitest.config.mts`. Tests live next to the code
  they cover (`Component.test.tsx`, co-located - see `components/core/Rating.test.tsx` for
  the reference example). 17 test files exist today, spanning core components, data-display,
  data-portal (the CRUD/edit surface), hooks, modals, and sections.
- **Backend handler tests**: `packages/api/vitest.config.mts` - a separate, deliberately
  minimal Vitest suite (11 files today) for handler/permission-gating logic that doesn't need
  a live database - no DB test container or fixtures exist yet, so this only covers what's
  testable in isolation (e.g. `lib/middleware/permissions.test.ts`, the permission-gating
  logic every Content Search & Bulk Edit procedure depends on). `pnpm test` (root or
  per-package) runs this alongside `packages/ui`'s suite, not instead of it.
- **Test utilities**: `packages/ui/test/test-utils.tsx` exports a `render()` that wraps
  components in the same `MantineProvider` theme (`storybookTheme`) Storybook already uses,
  plus a real i18next instance (`packages/ui/test/i18nTestInstance.ts`) initialized with the
  actual English `common` namespace - pluralization/interval behavior is verified against
  real locale content, not a mocked `t()` echo. Import `render`/`screen`/etc. from
  `~ui/test/test-utils`, not directly from `@testing-library/react`.
- **tRPC, narrow tests**: mock the specific hook a component uses via
  `vi.mock('~ui/lib/trpcClient', ...)` (see `Rating.test.tsx`). Fine for prop/render-logic
  checks that don't need to prove anything about caching or cross-component data sharing.
- **tRPC, real-cache integration tests**: `packages/ui/test/trpcIntegrationHarness.tsx` is a
  shared harness built specifically because per-hook mocks hand back data synchronously and
  are structurally incapable of catching cache-sharing/staleness bugs. It wires up a real
  `QueryClient` and real `trpc.Provider`/`createTRPCReact` client against an in-memory fake
  backend via msw, faking only the network boundary - so real `staleTime`, `invalidate`,
  `setData`, and cross-component-instance cache sharing are all genuinely exercised. See
  `PhoneNumbers.realCache.test.tsx` for the reference example. Use this (not per-hook mocks)
  whenever a test needs to verify the create/edit contract itself: save it, see it without
  refreshing; close, reopen, see the latest saved state - see
  [How to Use It](#how-to-use-it).
  - **Network jitter**: the harness supports opt-in randomized per-request delay via the
    `HARNESS_NETWORK_JITTER_MS` env var (0 by default - fully deterministic). A zero-latency
    fake backend can pass 100% of the time while a real timing-dependent race exists; setting
    e.g. `HARNESS_NETWORK_JITTER_MS=150` and repeating a test 10-25+ times surfaces races that
    only manifest when request ordering is realistic and variable. This already caught a real
    bug (a country-autodetect effect that permanently missed its chance if the user finished
    typing before a second, independent query resolved) that the same harness at zero latency
    could not reproduce.
- **jsdom gaps**: `packages/ui/test/setup.ts` polyfills `window.matchMedia`, which Mantine's
  responsive hooks (e.g. `Tooltip`'s `useMediaQuery`) call internally and jsdom doesn't
  implement. Add further polyfills here if a new test hits a similar jsdom gap.
- **End-to-end tests**: `apps/app/playwright.config.ts` + `apps/app/tests/**/*.spec.ts`, split
  into `tests/search/` (public search/view, no auth) and `tests/crud/` (authenticated
  data-entry/edit, currently empty - see the Plan below) per the read/write split. Run
  everything with `pnpm test:e2e` (or `pnpm test:e2e:ui` for Playwright's UI mode), or just
  one suite with `pnpm test:e2e:search` / `pnpm test:e2e:crud`. Chromium only for now - add
  firefox/webkit later if a real cross-browser bug ever shows up, not preemptively. Still just
  the one spec (`tests/search/home.spec.ts`) - no CRUD/edit e2e coverage and no authenticated
  session fixture exist yet; both are the near-term plan below.
- **Local dev server reuse**: the Playwright config reuses an already-running `pnpm dev`
  server if one exists (common - you're usually already running one) instead of failing on
  a port conflict; it only starts a fresh one (via the `webServer` block) when nothing's
  running, which is the CI case.
- **CI**: `.github/workflows/test.yml` runs `packages/ui`'s Vitest suite on every PR -
  **`packages/api`'s suite is not currently run in CI at all**, only locally (see Known
  Issues). The Playwright suite is **not yet wired into CI** either - it needs a live
  Postgres/Redis stack and seeded data to test real search/data-portal flows, which is a
  separate infrastructure decision (see Known Issues).
- **Viewing results**: see [Quick Reference](#quick-reference) for the actual commands and
  file paths - covered there once, not repeated here. The one thing worth knowing that isn't
  a command: Playwright's `error-context.md` (written per failing test under
  `apps/app/test-results/<test-name>/`) is a DOM snapshot at the exact moment of failure -
  the fastest way to diagnose a locator that matched nothing, since it shows you what was
  actually on the page instead of what the test expected.

## How to Use It

- Adding a unit/component test: put `Component.test.tsx` next to `Component.tsx`, import
  `render`/`screen` from `~ui/test/test-utils`, mock only the specific external calls
  (tRPC hooks, etc.) the component under test actually makes.
- Adding a test for a create/edit UI (forms, drawers, modals backed by tRPC + React Query):
  per-hook mocks are fine for narrow prop/render-logic checks, but don't stop there for the
  create/edit contract itself. At minimum, verify: save succeeds → the list/view showing that
  data updates immediately with no refresh; save → close → reopen → the form shows the exact
  just-saved values (not blank, not stale, not reverted); this keeps holding across repeated
  edit/save/reopen cycles on the same record. Build this on
  `~ui/test/trpcIntegrationHarness` (see `PhoneNumbers.realCache.test.tsx`), not per-hook
  mocks - a real shared cache is required to catch the class of bug where one component
  instance's write poisons what a different instance later reads. Treat this as the default
  bar for this class of feature, not something that needs to be asked for per task.
- Adding an e2e test: add a `*.spec.ts` file under `apps/app/tests/` (see the planned
  `search/` vs. `crud/` split below - place new specs accordingly once that split exists).
  Prefer testing that a whole flow completes (page loads, no console errors, a user action
  leads to the expected result) over testing implementation detail - e2e's real value is
  catching the class of bug that unit tests structurally can't (e.g. a webpack/bundler
  misconfiguration that throws `ReferenceError: exports is not defined` and crashes the
  entire app shell before any component-level code runs - see `home.spec.ts`'s smoke test
  for exactly this case).
- First-visit modal: the app shows an "Anti-hate commitment" dialog on first load that
  blocks interaction with the rest of the page. Dismiss it first
  (`page.getByRole('dialog').getByRole('button', { name: 'Accept' }).click()`) before
  interacting with anything else in a fresh-session e2e test.
- Autocomplete/geocoding timing: the location search dropdown populates from a debounced,
  real network call - don't assert on it immediately after `fill()`. Waiting for "an option to
  be visible" isn't enough by itself, though: while the debounced call is in flight,
  `SearchBox` renders its own loading-placeholder option (a bare spinner, no text -
  `SearchBox.tsx`'s `fetching` branch) that also satisfies `getByRole('option')`. Selecting
  that placeholder fails silently (no error, no navigation - its `value` never matches a real
  result once the API responds), so a test can flake exactly like a normal timing race despite
  "correctly" waiting for visibility first. Filter for an option with real text content
  instead - `page.getByRole('option').filter({ hasText: /\w/ })` - and give navigation
  assertions a longer timeout than the config's 5s default (see `tests/search/home.spec.ts`'s
  search test for the pattern; this exact bug was caught and fixed there on 2026-09-21 by
  actually running the suite, not just reading it).

## Test Automation Plan

Before writing tests for a given feature, build a test-case inventory first: every area of
that feature, and for each area, test cases with their expected result - written from what
the feature _should_ do, not derived from reading the implementation. This is what makes the
resulting tests useful for catching regressions instead of just re-confirming whatever the
code currently does (including any existing bugs). See
[search-test-inventory.md](search-test-inventory.md) for the reference example, covering the
search surface (URL parsing, location/org search, results rendering, filters, favoriting,
pagination, responsive behavior, and the intl fallback pages), and
[site-chrome-test-inventory.md](site-chrome-test-inventory.md) for the elements that render
on (almost) every page - the anti-hate first-visit modal, cookie consent, the navbar's
various menus/drawers, and the footer's links. Both include areas found to have no coverage
yet, real inconsistencies worth a product decision before writing a test against them (e.g.
the anti-hate modal's close-X having no distinct "decline" path from Accept), and
dead/unreachable code explicitly flagged so it isn't mistaken for a coverage gap.

This app also has two structurally different frontends, and the e2e suite should be organized
around that split rather than by page/route:

- **`tests/search/`** - public search & view flows. No auth required, can run against shared/
  seeded data, safe to run fully parallel. Contains `home.spec.ts` today; add new
  search-surface specs here as inventory cases (see above) get built out. Run in isolation
  with `pnpm test:e2e:search`.
- **`tests/crud/`** - authenticated data-entry/edit flows, organized further by entity (org,
  location, etc. - matching where the recent real bugs have actually been: title/description
  save, phone number CRUD). Currently empty - blocked on the auth fixture below. Each test
  needs to create its own fixture data and clean up after itself, since these tests mutate
  state - slower and more setup-heavy than the search suite, but that isolation is required
  once tests are writing data. Run in isolation with `pnpm test:e2e:crud`.

Why this split and not one flat `tests/` directory: read-only search tests can share fixtures
and run in full parallel safely; CRUD tests can't (test A's writes are test B's stale read).
Mixing both under one flat suite drags the fast, safe read-only tests down to the slower,
stateful pace the write tests need. The two `pnpm test:e2e:*` scripts also mean you're not
stuck running the slower CRUD suite (once it exists) just to check a search-only change, or
vice versa.

**Known gap blocking `tests/crud/`**: there's no authenticated-session fixture for Playwright
yet (no `storageState` setup, no login helper). That's the first piece of infrastructure
needed before any CRUD e2e spec can be written - solving it once (e.g. a Playwright global
setup that logs in and saves `storageState`, reused via `test.use({ storageState })`) unblocks
every CRUD spec after it, rather than each spec reinventing auth.

**Suggested order of work**, following the "add coverage where you're already touching real
bugs" pattern rather than a big up-front push:

1. Build the Playwright auth fixture (unblocks everything else in `tests/crud/`).
2. ~~Move `home.spec.ts` into `tests/search/`~~ done - add one or two more search-surface
   specs from the inventory above.
3. Add `tests/crud/org.spec.ts` covering the save/see-without-refresh/reopen contract at the
   e2e level for the org edit page - the same contract already covered at the component level
   in `orgEditFormDefaultValues.test.tsx` and the real-cache harness, but from a real browser
   against a real (or realistically seeded) backend.
4. Revisit CI wiring (see Known Issues) once there are enough CRUD specs to justify the
   Postgres/Redis infrastructure decision.

## Known Issues / Gotchas

- **`packages/api`'s Vitest suite is not run in CI.** `.github/workflows/test.yml` explicitly
  filters to `pnpm --filter @weareinreach/ui test`, installing with `--ignore-scripts` (a
  comment there explains this is safe specifically because `packages/ui`'s suite has no
  runtime dependency on `packages/db`'s postinstall-generated Prisma client). `packages/api`'s
  suite does **not** share that property - 9 of its 11 test files import `@weareinreach/db` or
  `@prisma/client` directly - so it can't simply be added to the same CI job as-is;
  `--ignore-scripts` would skip Prisma client generation and those 9 files would fail. Wiring
  it into CI needs either a separate job step that runs `db:generate` first, or dropping
  `--ignore-scripts` for a combined job (accepting the slower install). Until then,
  `packages/api`'s 11 test files only run locally - a PR that breaks
  `mutation.updateBasic.handler.test.ts` or similar would not be caught by CI.
- **Playwright e2e tests are not run in CI yet.** Nothing in this repo's CI currently spins
  up a live database, and running real search/data-portal e2e specs needs one (plus seeded
  data and real secrets). This is a deliberate scope decision, not an oversight - wiring it
  up is a separate, bigger piece of infrastructure work than adding the local test suite
  itself, worth doing once there are enough e2e specs (particularly `tests/crud/` specs) to
  justify it.
- **No Playwright auth fixture yet.** Blocks any authenticated/CRUD e2e spec - see the Plan
  section above.
- **Real-cache harness is per-repo convention, not enforced by tooling.** Nothing fails CI if
  a new create/edit test uses only per-hook mocks and skips the save/reopen contract - it
  relies on this doc and code review to catch it until/unless it's worth automating (e.g. a
  lint rule or PR template checklist item).
- **ESLint flat-config work is deferred**, separately from this doc's scope, until the
  Next 15/16 bump (see the library-update tracking) - not related to the test setup itself,
  but worth knowing the two are being sequenced together intentionally.

## Related Files

| Path                                                                              | Purpose                                                                                     |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `turbo.json`                                                                      | Declares `test`/`test:e2e*` tasks so root-level `pnpm test*` commands work                  |
| `lib/testDashboard.ts`                                                            | Local test dashboard server (`pnpm test:dashboard`) - trigger/view all suites from one page |
| `package.json` (repo root)                                                        | Root-level `test*` scripts that delegate to each package via turbo                          |
| `packages/api/vitest.config.mts`                                                  | Separate Vitest suite for backend handler/permission tests                                  |
| `packages/api/lib/middleware/permissions.test.ts`                                 | Reference example: the test this suite exists for                                           |
| `packages/ui/vitest.config.mts`                                                   | Vitest config (jsdom environment, React plugin)                                             |
| `packages/ui/test/setup.ts`                                                       | jest-dom matchers + jsdom polyfills                                                         |
| `packages/ui/test/test-utils.tsx`                                                 | Custom `render()` with Mantine + i18next providers                                          |
| `packages/ui/test/i18nTestInstance.ts`                                            | Real i18next instance for tests, real locale content                                        |
| `packages/ui/test/trpcIntegrationHarness.tsx`                                     | Real-cache tRPC integration harness, opt-in network jitter                                  |
| `packages/ui/components/core/Rating.test.tsx`                                     | Reference example: narrow per-hook-mocked unit test                                         |
| `packages/ui/components/data-display/ContactInfo/PhoneNumbers.realCache.test.tsx` | Reference example: real-cache create/edit contract test                                     |
| `packages/ui/test/orgEditFormDefaultValues.test.tsx`                              | Reference example: async-race regression test (RHF `defaultValues`)                         |
| `docs/Testing/search-test-inventory.md`                                           | Expectation-based test-case inventory for the search surface                                |
| `docs/Testing/site-chrome-test-inventory.md`                                      | Expectation-based test-case inventory for navbar, footer, anti-hate modal, cookie consent   |
| `apps/app/playwright.config.ts`                                                   | Playwright config (baseURL, dev-server reuse)                                               |
| `apps/app/tests/search/home.spec.ts`                                              | Reference example e2e smoke test (search/view surface)                                      |
| `.github/workflows/test.yml`                                                      | CI job running the Vitest suite on every PR                                                 |

---

_Last verified against code: 2026-09-21. If you change any file listed above, update this
doc in the same PR and bump this date._
