# Users Tab

## Overview

Manages staff (`User`) accounts' Data Portal permission tier and lets an admin
trigger a password-reset email. This is about _staff_ access to the Data Portal
itself, not end-user/consumer accounts.

## Access

Visible to `dataPortalManager` and above.

- **Viewing the list** requires `dataPortalManager`+ (`user.viewAllUsers` maps to
  `dataPortalManager` in `packages/api/lib/permissions.ts`).
- **Changing someone's access tier** actually requires `dataPortalAdmin`+ (or a
  verified `root`@inreach.org account) — see Known Issues, this is stricter than
  what the UI implies to a Manager-tier viewer.
- **Sending a password reset** has no server-side permission check at all — see
  Known Issues.

## How It Works

- **UI**: [`UserTable.tsx`](../../../packages/ui/components/data-portal/UserTable.tsx)
- **API**:
  - `user.forUserTable` → `query.forUserTable.handler.ts` — fetches `User` rows
    with their `permissions`, reduced to the single highest active Data Portal
    tier per user.
  - `user.toggleDataPortalAccess` → `mutation.toggleDataPortalAccess.handler.ts` —
    an `adminProcedure` (not the normal permission-map system). Inside a
    transaction it deletes all of the target's existing Data-Portal
    `UserPermission` rows and upserts the new one, using an audited Prisma client
    so the change lands in the audit trail.
  - `user.forgotPassword` → sends a Cognito forgot-password email; doesn't touch
    the database at all.
- **Data**: `User`, `Permission`, and the `UserPermission` join table (composite
  key `[userId, permissionId]`, `authorized` boolean).

## How to Use It

- Each row shows a user's name, email, verification status, activity dates, and
  their current Data Portal tier as a dropdown (**None / Basic / Manager / Admin /
  Root**).
- You can't grant someone a tier higher than your own, and the dropdown is
  disabled entirely for a target who already outranks you.
- **Reset** on a row sends that user a password-reset email via Cognito — it does
  not set or reveal a password directly.
- The "Data Entry Teams" selector and the row overflow-menu button in the toolbar
  are visual placeholders only — they have no handlers wired up yet.

## Known Issues / Gotchas

- **Manager can see a control they can't use**: the access-tier dropdown is only
  _partially_ disabled for a Manager-tier viewer (options above their own rank are
  disabled, but the control itself remains active). The underlying
  `toggleDataPortalAccess` mutation requires Admin/Root (`adminProcedure`), so a
  Manager attempting a change gets a server-side rejection after the fact instead
  of the option being disabled up front.
- **Password reset has no server-side permission gate.** `forgotPassword` is a
  `publicProcedure` — it's protected only by this tab not being shown to
  unauthorized sessions, not by the API itself. Blast radius is limited (it only
  emails the account owner a reset link), but it's worth tightening given
  everything else in this tab is otherwise carefully tiered.
- No account deactivation/delete control is exposed here — only the Data Portal
  tier and password reset.

## Related Files

| Path                                                                                                            | Purpose                                              |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`packages/ui/components/data-portal/UserTable.tsx`](../../../packages/ui/components/data-portal/UserTable.tsx) | Table UI, access-tier dropdown, reset-password modal |
| `packages/api/router/user/query.forUserTable.handler.ts`                                                        | List query                                           |
| `packages/api/router/user/mutation.toggleDataPortalAccess.handler.ts`                                           | Access-tier change (Admin/Root only)                 |
| `packages/api/router/user/mutation.forgotPassword.handler.ts`                                                   | Cognito password-reset trigger                       |
| `packages/api/router/user/index.ts`                                                                             | tRPC route registration, permission levels           |
| `packages/api/lib/middleware/permissions.ts`                                                                    | `adminProcedure`/`isAdmin` gate                      |
| `packages/db/prisma/schema.prisma` (`User` `~L65`, `Permission` `~L129`, `UserPermission` `~L1397-1407`)        | Schema                                               |

---

_Last verified against code: 2026-08-10._
