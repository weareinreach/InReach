# Automated Testing

## Overview

Two real, growing test suites: Vitest for unit/component tests (`packages/ui`), and
Playwright for end-to-end browser tests (`apps/app`). Both started from an empty/unused
scaffold — this doc describes what exists as of the date below, not an aspirational plan.
The intent is for this to grow incrementally as real work touches each area (most
immediately, the upcoming React 19 / Next 16 / Mantine 9 migration), rather than as a
separate up-front coverage push.

## How It Works

- **Unit/component tests**: `packages/ui/vitest.config.mts`. Tests live next to the code
  they cover (`Component.test.tsx`, co-located — see `components/core/Rating.test.tsx` for
  the reference example). Run with `pnpm test` from `packages/ui` (or `pnpm test:watch` for
  watch mode).
- **Test utilities**: `packages/ui/test/test-utils.tsx` exports a `render()` that wraps
  components in the same `MantineProvider` theme (`storybookTheme`) Storybook already uses,
  plus a real i18next instance (`packages/ui/test/i18nTestInstance.ts`) initialized with the
  actual English `common` namespace — pluralization/interval behavior is verified against
  real locale content, not a mocked `t()` echo. Import `render`/`screen`/etc. from
  `~ui/test/test-utils`, not directly from `@testing-library/react`.
- **tRPC**: mock the specific hook a component uses via `vi.mock('~ui/lib/trpcClient', ...)`
  (see `Rating.test.tsx`). There's no shared MSW-based tRPC mock harness yet — add one if a
  future test needs to exercise more than one or two hook calls, rather than hand-mocking
  each one.
- **jsdom gaps**: `packages/ui/test/setup.ts` polyfills `window.matchMedia`, which Mantine's
  responsive hooks (e.g. `Tooltip`'s `useMediaQuery`) call internally and jsdom doesn't
  implement. Add further polyfills here if a new test hits a similar jsdom gap.
- **End-to-end tests**: `apps/app/playwright.config.ts` + `apps/app/tests/*.spec.ts`. Run
  with `pnpm test:e2e` from `apps/app` (or `pnpm test:e2e:ui` for Playwright's UI mode).
  Chromium only for now — add firefox/webkit later if a real cross-browser bug ever shows
  up, not preemptively.
- **Local dev server reuse**: the Playwright config reuses an already-running `pnpm dev`
  server if one exists (common — you're usually already running one) instead of failing on
  a port conflict; it only starts a fresh one (via the `webServer` block) when nothing's
  running, which is the CI case.
- **CI**: `.github/workflows/test.yml` runs the Vitest suite on every PR. The Playwright
  suite is **not yet wired into CI** — it needs a live Postgres/Redis stack and seeded data
  to test real search/data-portal flows, which is a separate infrastructure decision (see
  Known Issues).

## How to Use It

- Adding a unit/component test: put `Component.test.tsx` next to `Component.tsx`, import
  `render`/`screen` from `~ui/test/test-utils`, mock only the specific external calls
  (tRPC hooks, etc.) the component under test actually makes.
- Adding an e2e test: add a `*.spec.ts` file under `apps/app/tests/`. Prefer testing that a
  whole flow completes (page loads, no console errors, a user action leads to the expected
  result) over testing implementation detail — e2e's real value is catching the class of
  bug that unit tests structurally can't (e.g. a webpack/bundler misconfiguration that
  throws `ReferenceError: exports is not defined` and crashes the entire app shell before
  any component-level code runs — see `home.spec.ts`'s smoke test for exactly this case).
- First-visit modal: the app shows an "Anti-hate commitment" dialog on first load that
  blocks interaction with the rest of the page. Dismiss it first
  (`page.getByRole('dialog').getByRole('button', { name: 'Accept' }).click()`) before
  interacting with anything else in a fresh-session e2e test.
- Autocomplete/geocoding timing: the location search dropdown populates from a debounced,
  real network call - don't assert on it immediately after `fill()`. Wait for the option to
  be visible first (see `home.spec.ts`'s search test for the pattern), and give navigation
  assertions a longer timeout than the config's 5s default.

## Known Issues / Gotchas

- **Playwright e2e tests are not run in CI yet.** Nothing in this repo's CI currently spins
  up a live database, and running real search/data-portal e2e specs needs one (plus seeded
  data and real secrets). This is a deliberate scope decision, not an oversight - wiring it
  up is a separate, bigger piece of infrastructure work than adding the local test suite
  itself, worth doing once there are enough e2e specs to justify it.
- **No shared tRPC mock harness yet.** Each test that needs tRPC data hand-mocks the
  specific hook it calls. Fine for a handful of tests; revisit (likely MSW-based, matching
  the pattern Storybook already uses via `.storybook/decorators/Trpc.tsx`) once enough
  tests need it that hand-mocking becomes repetitive.
- **ESLint flat-config work is deferred**, separately from this doc's scope, until the
  Next 15/16 bump (see the library-update tracking) - not related to the test setup itself,
  but worth knowing the two are being sequenced together intentionally.

## Related Files

| Path                                          | Purpose                                              |
| --------------------------------------------- | ---------------------------------------------------- |
| `packages/ui/vitest.config.mts`               | Vitest config (jsdom environment, React plugin)      |
| `packages/ui/test/setup.ts`                   | jest-dom matchers + jsdom polyfills                  |
| `packages/ui/test/test-utils.tsx`             | Custom `render()` with Mantine + i18next providers   |
| `packages/ui/test/i18nTestInstance.ts`        | Real i18next instance for tests, real locale content |
| `packages/ui/components/core/Rating.test.tsx` | Reference example unit/component test                |
| `apps/app/playwright.config.ts`               | Playwright config (baseURL, dev-server reuse)        |
| `apps/app/tests/home.spec.ts`                 | Reference example e2e smoke test                     |
| `.github/workflows/test.yml`                  | CI job running the Vitest suite on every PR          |

---

_Last verified against code: 2026-08-17. If you change any file listed above, update this
doc in the same PR and bump this date._
