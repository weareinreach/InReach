# Tasks

## Overview

The fourth top-level Data Portal section (`DataPortalHeaderBar`'s `'tasks'` id), alongside
Organizations, Admin, and System. Currently a placeholder — the nav label renders, disabled, with no
destination page.

## Access

N/A — nothing to gate. The header bar renders "Tasks" as plain, non-interactive text
(`enabled: false` in [`DataPortalHeaderBar.tsx`](../../../packages/ui/components/data-portal/DataPortalHeaderBar.tsx)),
with a `title='Not available yet'` tooltip, the same treatment `System` gets for non-`root` users.

## How It Works

- **UI**: [`DataPortalHeaderBar.tsx`](../../../packages/ui/components/data-portal/DataPortalHeaderBar.tsx)
  defines the `tasks` section with `enabled: false` and no `href` — there's no route, page, or
  side-nav config for it anywhere in the codebase yet.

## Known Issues / Gotchas

- **No page exists.** This folder exists so the docs tree mirrors the real section structure
  (`Tasks`/`Organizations`/`Admin`/`System`) ahead of there being anything to document — see
  [`docs/DataPortal/2026-Redesign/organization.md`](../2026-Redesign/organization.md)'s "Teams & Tasks"
  backlog entry (explicitly out of scope for now) for what this section is expected to eventually cover.

## Related Files

| Path                                                                                                                                | Purpose                                            |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [`packages/ui/components/data-portal/DataPortalHeaderBar.tsx`](../../../packages/ui/components/data-portal/DataPortalHeaderBar.tsx) | Defines the disabled `tasks` section               |
| [`docs/DataPortal/2026-Redesign/organization.md`](../2026-Redesign/organization.md)                                                 | "Teams & Tasks" backlog entry, explicitly deferred |

---

_Last verified against code: 2026-09-04._
