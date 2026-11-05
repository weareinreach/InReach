# InReach Data Portal: Access Control & Permission Hierarchy

This document defines the roles, permissions, and data lifecycle management for the InReach Data Portal.

## Current Functionality

The portal uses a **Cascading Hierarchy**. Each level inherits the permissions of the level below it. Access is enforced through three primary middlewares in `packages/api/lib/middleware/permissions.ts`.

| Middleware           | Usage Type              | Logic & Target Roles                                                                                                                                                                                                     |
| :------------------- | :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`isAdmin`**        | `adminProcedure`        | **The Management Gate:**<br>Restricts access to the **User Management** and **Teams** tabs. <br>• **Root:** Full access (requires `@inreach.org` email).<br>• **Admin:** Full access.                                    |
| **`isStaff`**        | `staffProcedure`        | **The Dashboard Gate:**<br>The entry point for the `/admin` dashboard. Allows users to see the **Organization** and **User** tabs (with internal filtering).<br>• **Basic, Manager, Admin, and Root** are all permitted. |
| **`hasPermissions`** | `permissionedProcedure` | **The Scoped Gate:**<br>Used for external Org Owners/Associates. It validates specific permission strings (e.g., `editSingleOrg`) for users who do not have a Data Portal role.                                          |

### The Permission Ladder (`checkPermissions`)

When a procedure is called, the logic evaluates the user's highest role.

1.  **Root Bypass:** If the user holds `root` (`ROOT_TIER_PERMISSIONS` in `packages/db/lib/rootTierPermissions.ts`) AND has an `@inreach.org` email, all checks return `true`. This used to also check for `sysadmin`/`system`, three independently-maintained copies of the same literal array - neither was ever a real row in the `Permission` table, so neither could ever actually be held by a user. Centralized and the two dead names dropped per #2107/#2114.
2.  **The Blocklists (Restricted Access):**
    - **System Blocklist:** (`adminPermissions`, `root`) - Only **Root** passes.
    - **Admin Blocklist:** (`adminRoles`, `dataPortalAdmin`) - Only **Admin & Root** pass.
    - **Manager Blocklist:** (`viewAllUsers`, `deleteUserReview`) - Only **Manager, Admin, & Root** pass.
3.  **Global Org Access:** Any user with `dataPortalBasic` or higher is automatically granted access to Organization, Location, and Service editing strings (e.g., `editAnyOrg`, `createLocation`) because they are not on the restricted blocklists.

---

## 1. Data Lifecycle & Safety Mechanics

- **Soft Delete:** Flipping a `deleted: true` flag. The record remains in the primary table but is hidden from public views.
- **Atomic Hard Delete:** Permanent removal. Allowed only if the record has 0 child associations (e.g., an Org with no Locations).
- **Complex Archiving:** Moving an entire tree (Org + Locations + Services) into the `deletedOrg` Archive Table as a JSONB blob.

---

## 2. Role Definitions

### 🟢 Root ("The System Owner")

- **Capabilities:** Everything. The only role that can assign the `dataPortalAdmin` role or perform a "Hard Purge" of the archives.
- **Requirement:** `root` permission + `@inreach.org` email domain.
- **`sysadmin`/`system` are not separate roles:** these names used to appear alongside `root` in every "God tier" check, but were never real permissions - carried forward from an older role-based system (pre-dating the current permission-string model), not roles with capabilities of their own. Dropped from the permission checks (#2107/#2114). `UserType`'s `sysadmin`/`system` values (a separate, signup-time account-category field, unrelated to this permission system) are untouched by this and remain just account labels.

### 🟡 Admin ("The Operations Chief")

- **Capabilities:** Full data access. Can manage **Managers** and **Basic** users. Can hard-delete empty Organizations.
- **Requirement:** `dataPortalAdmin` permission.

### 🔵 Manager ("The Team Supervisor")

- **Capabilities:** Full data access. Can view the User List and manage **Basic** users (assign Basic or Manager roles). Can soft-delete records.
- **Requirement:** `dataPortalManager` permission.

### 🟠 Basic ("The Data Entry / Volunteer")

- **Capabilities:** Full access to view and edit all Organization/Location/Service data. No access to User Management or Teams.
- **Requirement:** `dataPortalBasic` permission.

---

## 3. Permission Matrix

| Capability                 | Basic | Manager | Admin | Root |
| :------------------------- | :---: | :-----: | :---: | :--: |
| Edit All Org/Location Data |  ✅   |   ✅    |  ✅   |  ✅  |
| Soft Delete (Flag)         |  ✅   |   ✅    |  ✅   |  ✅  |
| View User List             |  ❌   |   ✅    |  ✅   |  ✅  |
| Assign Basic/Manager Roles |  ❌   |   ✅    |  ✅   |  ✅  |
| Assign Admin Roles         |  ❌   |   ❌    |  ✅   |  ✅  |
| Assign Root Roles          |  ❌   |   ❌    |  ❌   |  ✅  |
| Hard Delete (Empty Orgs)   |  ❌   |   ❌    |  ✅   |  ✅  |
| Archive (Complex Orgs)     |  ❌   |   ❌    |  ❌   |  ✅  |

---

## 4. Future Plans: Fully Dynamic RBAC

Currently, hierarchy is enforced via logical "blocklists" in the middleware. The goal is to move toward a metadata-driven system for easier scaling.

### Path to Implementation:

1.  **Database Migration:** Add a `weight` or `rank` column to the `Permission` table.
    - `root` = 100, `admin` = 80, `manager` = 60, `basic` = 40.
2.  **Logic Refactor:** Update `checkPermissions` to compare numeric weights. Access is granted if `userRank >= requiredProcedureRank`.
3.  **Security Auditing:** Implement a decorator for all sensitive procedures to log `actorId`, `targetId`, and `action` into a dedicated `AuditLog` table.
4.  **UI Consistency:** Utilize the hierarchy-aware `DataPortalAccessSelect` across all user-facing management tools to ensure visual consistency with backend enforcement.

---

## 5. Known Gap: The Scoped Gate Is Not Actually Scoped

`hasPermissions` (the "Scoped Gate" in the table above) is unused in production today - no account
exists that reaches it without also holding a Data Portal role, and the only way to create one
(`user.adminCreate`'s `orgPermission`/`locationPermission` input) has no UI calling it. The two gaps
below are not live security issues under the current system, but they must be closed before any
external Org Owner/Associate account feature is built on top of this gate - otherwise every such
account would inherit them from day one.

1.  **No actual org/location scoping.** `checkPermissions` only checks whether a permission string
    (e.g. `editSingleOrg`) exists anywhere on the account - it never compares against the specific
    `organizationId`/`orgLocationId` in the request. The `OrganizationPermission`/`LocationPermission`
    tables exist for exactly this purpose but are never read by the authorization check. Before any
    external account relies on this gate, it must verify the request's target org/location against
    those tables, not just the presence of the permission string.

2.  **Unverified AND/OR semantics for list-shaped permissions.** When a permission requirement is an
    array (e.g. `attachOrgAttributes: ['editTeamOrg', 'editAnyOrg', 'editSingleOrg']`), the Scoped
    Gate currently requires the account to hold _all_ of them (`.every()`). This logic predates the
    Basic/Manager/Admin role system and has had no live caller - and therefore no real-world
    verification - since that system was introduced. Given these permission names read as alternative
    scope tiers (single org vs. a group vs. any org) rather than capabilities a single account would
    hold simultaneously, "any one of these" (`.some()`) is the more likely intended behavior, but this
    needs to be decided and tested deliberately when this gate is built out, not assumed.

**Before shipping Org Owner/Associate accounts:** resolve both items above together, and add test
coverage for the Scoped Gate branch of `checkPermissions` (currently has none).
