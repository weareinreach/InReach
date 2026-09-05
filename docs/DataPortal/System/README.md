# System

## Overview

One of the four top-level Data Portal sections (`DataPortalHeaderBar`'s `'system'` id), gated to
`root` — rendered as disabled/grayed-out text for every other permission tier, the same visual
treatment `Tasks` gets for everyone. Routes to `/data-portal/quicklink`.

## Access

`root` only. `DataPortalHeaderBar` computes `systemEnabled` from the signed-in session's permissions
(`['root', 'sysadmin', 'system'].includes(p)`) purely as a UI affordance (clickable vs. grayed out) —
it grants no access on its own. The real gate is
[Quicklink](./Quicklink/README.md)'s own `getServerSideProps` (root + `@inreach.org`, checked
server-side).

## How It Works

- **UI (nav)**: [`DataPortalHeaderBar.tsx`](../../../packages/ui/components/data-portal/DataPortalHeaderBar.tsx)
  defines the `system` section (`href: '/data-portal/quicklink'`, `enabled: systemEnabled`).
- Its side nav has exactly one item — **[Quicklink](./Quicklink/README.md)** — which drops in the
  existing Quicklink tool unchanged, including its own internal tab bar (Phone Numbers / Email
  Addresses / Location Services). Those three tabs are Quicklink's own internal navigation, not
  additional System-section side-nav items.

## Related Files

| Path                                                                                                                                | Purpose                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [`packages/ui/components/data-portal/DataPortalHeaderBar.tsx`](../../../packages/ui/components/data-portal/DataPortalHeaderBar.tsx) | Defines the `system` section, `systemEnabled` computation |
| [`Quicklink/README.md`](./Quicklink/README.md)                                                                                      | The section's one side-nav item                           |

---

_Last verified against code: 2026-09-04._
