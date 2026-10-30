# Manage Users

## Overview

Manages staff (`User`) accounts' Data Portal permission tier and gives staff four
account-recovery actions for an end user stuck on login. This is about _staff_
access to the Data Portal itself for the permission-tier piece, but the four
recovery actions act on the target _end-user's_ Cognito account, not the staff
viewer's own. Lives at `/data-portal/manage-users` (previously the "Users" tab at
`/admin` — renamed to match the 2026 redesign's naming; see
[`docs/DataPortal/2026-Redesign/UI_elements.md`](../../2026-Redesign/UI_elements.md)).

## Access

Gated at `dataPortalManager` and above in this page's own `getServerSideProps`
(`apps/app/src/pages/data-portal/manage-users.tsx`).

- **Viewing the list** requires `dataPortalManager`+ (`user.viewAllUsers` maps to
  `dataPortalManager` in `packages/api/lib/permissions.ts`).
- **Changing someone's access tier** actually requires `dataPortalAdmin`+ (or a
  verified `root`@inreach.org account) — see Known Issues, this is stricter than
  what the UI implies to a Manager-tier viewer.
- **All four account-recovery actions** (reset password / set temporary password
  / resend verification / force verification) are gated the same as viewing the
  list — `permissionedProcedure('viewAllUsers')`, i.e. `dataPortalManager`+. This
  used to not be true for password reset (see Known Issues in an earlier version
  of this doc) — it was tightened alongside a broader fix to stop the _public_
  versions of these endpoints leaking account-enumeration info.

## How It Works

- **UI**: [`UserTable.tsx`](../../../../packages/ui/components/data-portal/UserTable.tsx),
  built on the shared
  [`DataTable`](../../../../packages/ui/components/data-portal/DataTable/index.tsx)
  component, rendered from
  [`apps/app/src/pages/data-portal/manage-users.tsx`](../../../../apps/app/src/pages/data-portal/manage-users.tsx).
  The four recovery actions share an `ActionItem` shell (tooltip-labeled icon +
  confirm modal) and a `ConfirmBody` layout (explanation, confirm question,
  Yes/No) defined at the top of `UserTable.tsx`.
- **API** (all four of the following are `permissionedProcedure('viewAllUsers')`,
  and — unlike their public counterparts below — return the real Cognito outcome
  rather than a generic success, since staff already has legitimate visibility
  into account state via this table):
  - `user.forUserTable` → `query.forUserTable.handler.ts` — server-side search
    (name/email) and sort, paginated, fetching `User` rows with their
    `permissions`, reduced to the single highest active Data Portal tier per user.
  - `user.toggleDataPortalAccess` → `mutation.toggleDataPortalAccess.handler.ts` —
    an `adminProcedure` (not the normal permission-map system). Inside a
    transaction it deletes all of the target's existing Data-Portal
    `UserPermission` rows and upserts the new one, using an audited Prisma client
    so the change lands in the audit trail.
  - `user.adminResetPassword` → sends a real Cognito password-reset email
    (`@weareinreach/auth/forgotPassword`'s `forgotPassword`). Doesn't set or
    reveal a password directly; only works if the email actually reaches the
    user.
  - `user.adminSetTemporaryPassword` → `@weareinreach/auth/adminSetTemporaryPassword`
    — sets a one-time password directly via Cognito's `AdminSetUserPassword`
    (`Permanent: false`), no email involved. Returns the generated password for
    staff to relay out-of-band (phone, verified chat — never email, since that's
    the problem this exists for). The user is still required to choose their own
    real password on their next login — Cognito returns a `NEW_PASSWORD_REQUIRED`
    challenge instead of a normal success, which the main login form
    (`packages/ui/modals/LoginSignUp/index.tsx`) and
    `user.completeNewPasswordChallenge` handle; staff never learns the password
    the account ends up using.
  - `user.adminResendCode` → resends the Cognito account-verification email.
  - `user.adminConfirmUser` → `@weareinreach/auth/adminConfirmUser` — force-confirms
    the account via Cognito's `AdminConfirmSignUp`, no code or link needed.
- **Not used by this table** (kept registered for the public, unauthenticated
  self-service flow instead — see
  [`packages/ui/modals/TroubleLoggingIn.tsx`](../../../../packages/ui/modals/TroubleLoggingIn.tsx)):
  `user.forgotPassword` and `user.resendCode`. These are deliberately
  enumeration-safe — they always return a generic success regardless of whether
  the account exists, is confirmed, or the Cognito call actually succeeded,
  logging the real outcome server-side only. That's exactly why this table uses
  the separate `admin*` endpoints above instead: staff legitimately need the real
  outcome, which the public versions intentionally never reveal.
- **Data**: `User`, `Permission`, and the `UserPermission` join table (composite
  key `[userId, permissionId]`, `authorized` boolean).

## How to Use It

- Each row shows a user's name, email, verification status, activity dates, and
  their current Data Portal tier as a dropdown (**None / Basic / Manager / Admin /
  Root**).
- You can't grant someone a tier higher than your own, and the dropdown is
  disabled entirely for a target who already outranks you.
- The Actions column has four icons, organized as two pairs — a preferred,
  email-dependent action and a no-email escalation — for each of the two
  problems a user can get stuck on. Hovering each icon explains which pair it's
  in and when to use it, so picking the right one doesn't require understanding
  Cognito, SES, or email deliverability:
  - **Send Password Reset Link** → **Set Temporary Password** (escalation: use
    when the user says a reset email never arrived; reveals a one-time password
    for staff to share directly, not by email).
  - **Resend Verification Link** → **Force Verification** (escalation: use when
    the user says a verification email never arrived; confirms the account with
    no email at all).
- The two verification actions' tooltips note when a user already shows as
  verified, but neither is disabled in that case — the "verified" signal is this
  app's own database, which can drift from Cognito's actual state, and Force
  Verification exists specifically to fix that kind of mismatch. Disabling it
  based on a signal that can itself be wrong would block the one tool meant to
  correct it.

## Known Issues / Gotchas

- **Manager can see a control they can't use**: the access-tier dropdown is only
  _partially_ disabled for a Manager-tier viewer (options above their own rank are
  disabled, but the control itself remains active). The underlying
  `toggleDataPortalAccess` mutation requires Admin/Root (`adminProcedure`), so a
  Manager attempting a change gets a server-side rejection after the fact instead
  of the option being disabled up front.
- No account deactivation/delete control is exposed here — only the Data Portal
  tier and the four recovery actions.
- No Teams concept exists anywhere in this table or the underlying schema — a
  "Data Entry Teams" filter and a row overflow-menu were noted here in an earlier
  version of this doc as unwired placeholders, but neither exists in the current
  `UserTable.tsx` at all (confirmed via `git log` — most likely removed during the
  Mantine v7 migration). The 2026 redesign's Manage Teams concept
  (`docs/DataPortal/2026-Redesign/UI_elements.md`) is a ground-up build, not a
  resurfacing of anything that currently exists.
- **No shared page chrome yet** — this page currently renders standalone, not yet
  inside the new redesign's header bar/side-nav/page-heading shell — that's a
  later phase.
- **`UserTable.stories.tsx` only mocks the read query** (`user.forUserTable`,
  `user.searchTypeahead`) — clicking any of the four recovery actions in
  Storybook will hit an unhandled MSW request. Pre-existing (true even for the
  single old "Reset" action before this doc's last update), not something
  introduced by the actions described above.
- A likely root cause for why some users never receive a verification/reset
  email at all: `inreach.org`'s SPF record doesn't authorize Amazon SES, and the
  domain itself was never verified in SES for DKIM — unauthenticated mail is
  prone to silent filtering by strict spam filters (e.g. university mail
  systems). That's a DNS fix, not something in this codebase; `Set Temporary
Password`/`Force Verification` exist partly as a workaround for it.

## Related Files

| Path                                                                                                               | Purpose                                                    |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| [`apps/app/src/pages/data-portal/manage-users.tsx`](../../../../apps/app/src/pages/data-portal/manage-users.tsx)   | Page: permission gate, renders `UserTable`                 |
| [`packages/ui/components/data-portal/UserTable.tsx`](../../../../packages/ui/components/data-portal/UserTable.tsx) | Table UI, access-tier dropdown, the four recovery actions  |
| `packages/api/router/user/query.forUserTable.handler.ts`                                                           | List query                                                 |
| `packages/api/router/user/mutation.toggleDataPortalAccess.handler.ts`                                              | Access-tier change (Admin/Root only)                       |
| `packages/api/router/user/mutation.adminResetPassword.handler.ts`                                                  | Cognito password-reset email (real outcome, staff-only)    |
| `packages/api/router/user/mutation.adminSetTemporaryPassword.handler.ts`                                           | One-time password, no email (staff-only)                   |
| `packages/api/router/user/mutation.adminResendCode.handler.ts`                                                     | Verification-email resend (real outcome, staff-only)       |
| `packages/api/router/user/mutation.adminConfirmUser.handler.ts`                                                    | Force-confirm account, no email (staff-only)               |
| `packages/api/router/user/mutation.completeNewPasswordChallenge.handler.ts`                                        | Public - completes the temporary-password login challenge  |
| `packages/auth/lib/adminSetTemporaryPassword.ts`, `adminConfirmUser.ts`, `completeNewPasswordChallenge.ts`         | Cognito calls backing the staff-only endpoints above       |
| [`packages/ui/modals/LoginSignUp/index.tsx`](../../../../packages/ui/modals/LoginSignUp/index.tsx)                 | Login form - handles the `NEW_PASSWORD_REQUIRED` challenge |
| `packages/api/router/user/index.ts`                                                                                | tRPC route registration, permission levels                 |
| `packages/api/lib/middleware/permissions.ts`                                                                       | `adminProcedure`/`isAdmin` gate                            |
| `packages/db/prisma/schema.prisma` (`User` `~L65`, `Permission` `~L129`, `UserPermission` `~L1397-1407`)           | Schema                                                     |

---

_Last verified against code: 2026-10-30._
