# Review Table Implementation Plan

This plan outlines the steps to add a new "Reviews" tab to the DataPortal admin page. The Reviews tab will render a table showing user reviews with organization, service, and user data. It will allow basic staff to toggle review visibility (hide/unhide) and managers/admins to delete/undelete reviews. All modifications will automatically be audited in the database via existing Postgres triggers.

## User Review Required

> [!IMPORTANT] > **Toggling Action Permissions**:
>
> - Basic volunteers (`dataPortalBasic` and higher) will be allowed to hide/unhide reviews.
> - Managers (`dataPortalManager` and higher) will be allowed to delete/undelete reviews.
> - No direct editing of review text or ratings will be supported (preserving data integrity).

## Proposed Changes

---

### Backend (tRPC Router & Permissions)

#### [NEW] [query.forReviewTable.schema.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/router/review/query.forReviewTable.schema.ts)

- Define the input schema for fetching reviews. Initially void/empty, but matching the shape of `forOrganizationTable` to support optional filters.

#### [NEW] [query.forReviewTable.handler.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/router/review/query.forReviewTable.handler.ts)

- Implement the handler fetching all reviews via `prisma.orgReview.findMany`.
- Include relations: `organization`, `orgService` (with `serviceName` FreeText structure), and `user` (name, email).
- Sort by `createdAt` descending by default.

#### [MODIFY] [schemas.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/router/review/schemas.ts)

- Export the new schema from `query.forReviewTable.schema`.

#### [MODIFY] [index.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/router/review/index.ts)

- Register the new `forReviewTable` query procedure under `reviewRouter` using the `viewAllReviews` permission key.

#### [MODIFY] [permissions.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/lib/permissions.ts)

- Add `viewAllReviews: 'dataPortalBasic'` mapping to the `reviews` permission group, enabling basic staff and above to query the table.

#### [MODIFY] [permissions.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/lib/middleware/permissions.ts)

- Ensure `undeleteUserReview` is added to the `managerOnly` list (joining `deleteUserReview` which is already restricted to Managers and above).

---

### UI Components (Packages)

#### [NEW] [ReviewTable.tsx](file:///Users/dlg/Projects/InReach_2024/InReach/packages/ui/components/data-portal/ReviewTable.tsx)

- Build the `ReviewTable` component using `mantine-react-table`.
- Add columns:
  - **ID**: Hidden by default.
  - **Rating**: Rendered numerically or as star icons.
  - **Review Text**: Left-aligned, wrapping text.
  - **User**: Name and Email.
  - **Organization / Service**: Custom cell showing Organization name (linking to slug page) and Service name (if applicable).
  - **Status Indicators**: Show if the review is hidden (`visible === false`) or deleted (`deleted === true`).
  - **Created At**: Date-formatted relative timestamp with tooltip calendar.
- Add actions:
  - **View Details**: Similar to `OrganizationTable`, provide links/buttons to view the organization page (`/org/[slug]`) or edit page (`/org/[slug]/edit`).
  - **Visibility Switch**: Toggles `visible` via calling `review.hide` and `review.unHide` mutations (Basic and above).
  - **Delete/Undelete Row Actions**: Contextual button to delete/undelete reviews (Manager and above).

#### [NEW] [ReviewTable.stories.tsx](file:///Users/dlg/Projects/InReach_2024/InReach/packages/ui/components/data-portal/ReviewTable.stories.tsx)

- Storybook file to display and test the `ReviewTable` component in isolation.

---

### Admin Dashboard (App Pages)

#### [MODIFY] [index.tsx](file:///Users/dlg/Projects/InReach_2024/InReach/apps/app/src/pages/admin/index.tsx)

- Import the new `ReviewTable` component from `@weareinreach/ui`.
- Setup `canAccessReviews` using the same criteria as `canAccessOrganizations` (`dataPortalBasic` and higher).
- Insert the new `"reviews"` tab in the `Tabs.Tab` list and `Tabs.Panel` list directly between `"organizations"` and `"reports"`.
- Register tab query parameter syncing logic so that visiting `/admin?tab=reviews` correctly loads the tab.

---

## Verification Plan

### Automated Tests

- Run `pnpm run type-check` in packages/api, packages/ui, and apps/app to verify type safety.
- Run `pnpm run lint` across the project workspace to ensure ESLint conformance.

### Manual Verification

- Log in as a `Basic` level user, navigate to `/admin`, verify the **Reviews** tab is visible, and toggle visibility of a review. Inspect that delete actions are hidden/blocked.
- Log in as a `Manager` level user, verify the **Reviews** tab is visible, and perform both visibility toggle and delete/undelete actions.
- Review the organization's Activity Log (Audit Trail) to verify that visibility toggles and deletions appear in the logs.
