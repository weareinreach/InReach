# Admin

## Overview

One of the four top-level Data Portal sections (`DataPortalHeaderBar`'s `'admin'` id), routing to
`/data-portal/manage-users`. Its side nav lists three items — only one is real.

## Access

Section itself has no separate gate beyond reaching one of its pages; see each nav item below.

## How It Works

- **UI (nav)**: [`DataPortalHeaderBar.tsx`](../../../packages/ui/components/data-portal/DataPortalHeaderBar.tsx)
  defines the `admin` section (`href: '/data-portal/manage-users'`). The section's own side nav
  (`adminSideNav`, defined locally in
  [`manage-users.tsx`](../../../apps/app/src/pages/data-portal/manage-users.tsx)) lists:
  - **[Manage Users](./ManageUsers/README.md)** — real, clickable.
  - **Manage teams** — visible, disabled. No `Team` model exists in the schema at all.
  - **Properties manager** — visible, disabled. No equivalent exists anywhere in the codebase;
    scope undetermined — see
    [`docs/DataPortal/2026-Redesign/UI_elements.md`](../2026-Redesign/UI_elements.md)'s Open
    Questions.

## Related Files

| Path                                                                                                                                | Purpose                                   |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [`packages/ui/components/data-portal/DataPortalHeaderBar.tsx`](../../../packages/ui/components/data-portal/DataPortalHeaderBar.tsx) | Defines the `admin` section               |
| [`apps/app/src/pages/data-portal/manage-users.tsx`](../../../apps/app/src/pages/data-portal/manage-users.tsx)                       | `adminSideNav` config + the one real page |
| [`ManageUsers/README.md`](./ManageUsers/README.md)                                                                                  | The section's one real side-nav item      |

---

_Last verified against code: 2026-09-04._
