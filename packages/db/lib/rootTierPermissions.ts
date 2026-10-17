/**
 * The permission value every "God tier, full access" check in this codebase tests for. Was `['root',
 * 'sysadmin', 'system']` - `sysadmin`/`system` were never real `Permission` rows (no user could ever hold
 * one: `UserPermission`/`RolePermission` have a foreign key into `Permission`, and
 * `packages/db/generated/permission.ts`, generated straight from the live table, never contained either name)
 * and were deliberately dropped rather than seeded for real. See #2107, #2114.
 */
export const ROOT_TIER_PERMISSIONS: readonly string[] = ['root']
