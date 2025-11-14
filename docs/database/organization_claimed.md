# Organization “Claimed” Status

This document explains how the **claimed status** of an organization is determined.

## Relevant Models

### Organization
- Main entity representing an organization
- Key fields/relations:
  - `allowedEditors` → OrganizationPermission
  - `associatedUsers` → UserToOrganization (currently ignored for claiming)

### OrganizationPermission
- Links a User to an Organization with specific permissions
- Key field:
  - `authorized: Boolean` → indicates official ability to manage the organization

### UserToOrganization
- Links a User to an Organization as staff
- Not currently used for determining claimed status

---

## Claimed Logic

- **Definition:** An organization is claimed if there is at least one authorized `OrganizationPermission`
- **Implementation:** In the TRPC query `forOrgPageEdits`, `forOrgPage`, `forLocationPageEdits`:
  - `isClaimed: Boolean(allowedEditors.length)`
  - `allowedEditors` comes from:
    - `allowedEditors: { where: { authorized: true }, select: { userId: true } }`

- **Result:**
  - `isClaimed = true` → at least one authorized editor exists
  - `isClaimed = false` → no authorized editors exist

---

## Notes / Caveats

- `UserToOrganization` currently **does not affect** claimed status
- Future logic could include it:
  - `isClaimed: Boolean(allowedEditors.length || org.associatedUsers.some(u => u.authorized))`
- Field is computed in the `forOrgPageEdits` TRPC query

---

## Summary Diagram (Simplified)

Organization  
├─ allowedEditors (OrganizationPermission)  
│    └─ authorized = true → contributes to isClaimed  
└─ associatedUsers (UserToOrganization)  
     └─ currently ignored


## query to find claimed orgs and the user with permission
```
SELECT
    o.id AS organization_id,
    o.name AS organization_name,
    u.id AS user_id,
    u.name AS user_name,
	u.email AS user_email,
    p.name AS permission_name
FROM public."Organization" o
JOIN public."OrganizationPermission" op
    ON op."organizationId" = o.id
    AND op.authorized = true
JOIN public."User" u
    ON u.id = op."userId"
JOIN public."Permission" p
    ON p.id = op."permissionId"
ORDER BY o.name, u.name;
```
