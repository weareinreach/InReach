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

1.  **Root Bypass:** If the user is `root`, `sysadmin`, or `system` AND has an `@inreach.org` email, all checks return `true`.
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
