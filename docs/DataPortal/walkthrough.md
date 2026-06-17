# Reviews Moderation Table Walkthrough

We have successfully implemented the Reviews moderation table and integrated it into the DataPortal admin interface.

## Changes Made

### 1. Backend & Routing

- **tRPC Endpoint Schema & Handler**:
  - Created [query.forReviewTable.schema.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/router/review/query.forReviewTable.schema.ts) defining the input shape.
  - Created [query.forReviewTable.handler.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/router/review/query.forReviewTable.handler.ts) querying all `orgReview` records including their user profile, associated organization name, and service name.
  - Exposed and registered the new route in the review router [index.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/router/review/index.ts) and [schemas.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/router/review/schemas.ts).
- **Permissions & Access Control**:
  - Added a new permission mapping `viewAllReviews: 'dataPortalBasic'` in [permissions.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/lib/permissions.ts) to permit basic staff to retrieve reviews.
  - Restricted undeleting reviews to managers or higher by adding `undeleteUserReview` to the `managerOnly` check blocklist in [permissions.ts](file:///Users/dlg/Projects/InReach_2024/InReach/packages/api/lib/middleware/permissions.ts).

### 2. UI Components

- **ReviewTable Component**:
  - Implemented [ReviewTable.tsx](file:///Users/dlg/Projects/InReach_2024/InReach/packages/ui/components/data-portal/ReviewTable.tsx) using `mantine-react-table`.
  - Split user details into separate **User Name** and **User Email** columns for independent sorting, filtering, and a cleaner tabular layout.
  - Added clean formatting for rating (`⭐ X/5`), content, relative creation time with detail tooltip, and current visibility status badge.
  - Added a Mantine `Switch` component in each row for toggling review visibility (hide/unhide mutations).
  - Configured delete/undelete action buttons (restricting them to Manager-level permissions or higher).
  - Provided direct links in the "Target Details" column to view/edit the associated organization details page (`/org/[slug]`).
  - Added null safety checks for the `organization` relation in accessor functions and renderers to prevent UI crashes in the event of dangling review records.
- **Storybook Support**:
  - Created [ReviewTable.stories.tsx](file:///Users/dlg/Projects/InReach_2024/InReach/packages/ui/components/data-portal/ReviewTable.stories.tsx) to showcase and test the table using MSW handlers to mock all backend queries and toggle/delete mutations in isolation.

### 3. Admin Dashboard Integration

- **Reviews Tab Placement**:
  - Modified [index.tsx](file:///Users/dlg/Projects/InReach_2024/InReach/apps/app/src/pages/admin/index.tsx) to render the new tab panel between the "Organizations" and "Reports" tabs.
  - Tied permissions to `canAccessReviews` (equal access rule to the Organizations list: basic and above).
  - Synchronized query parameter updates so that selecting the Reviews tab appends `?tab=reviews` in the browser URL and retains selection upon refresh.

---

## Verification Results

- **Type Safety & Linter**:
  - The `@weareinreach/api` and `@weareinreach/ui` packages compile and pass type checks cleanly.
  - ESLint rules are fully respected; all modified packages passed lint validation checks with no errors or formatting complaints.
