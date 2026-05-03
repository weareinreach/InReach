# Reporting Organizations and Services

This document provides an overview of the Reporting feature, which allows users to flag inaccuracies in the data portal and enables staff to manage these corrections efficiently.

---

## Part 1: Staff and User Guide

### For Users: How to Report an Issue

Users can submit a report whenever they find information that is out-of-date or incorrect.

1. **Open the Report Modal:** On any Organization or Service page, users click the "Report an Issue" button.
2. **Select an Issue Type:** Users choose from the following categories:
   - **Closed or Inactive:** Flagging that a service or organization is no longer operating.
   - **Incorrect Information:** Users can specify exactly which fields are wrong (e.g., Name, Description, Address, Contact Info).
   - **Translation Quality:** Specifically for reporting poor machine translations in a particular language.
   - **Something Else:** A catch-all for any other data concerns.
3. **Add Details:** Users provide a note describing the correction. If they selected "Incorrect Information," they are encouraged to provide the "Corrected Information" in the text box.
4. **Submit:** Once submitted, the report is saved to the system for review.

### For Admins: Managing Reports

Staff members with the **Data Portal Manager** (`dataPortalManager`) role or higher can view and act on these reports via the **Admin Dashboard**.

**The Reports Table:**

- Located in the "Reports" tab of the Admin portal.
- Displays the reported item (Organization or Service name), the issue type, current status, and timestamps.
- **Status Color Coding:** Statuses are color-coded based on urgency. For example, "Pending" reports older than 3 days appear in bold red.

**Acting on a Report:**

- **View Details:** Clicking the magnifying glass opens a detailed view of the user's report, including snapshots of the information at the time it was reported.
- **Update Status:** Staff can move a report from **Pending** to **Acknowledged** (currently being worked on) or **Resolved**.
- **Informed Checkbox:** Staff can mark whether the user who reported the issue has been notified of the fix.
- **Resolution Notes:** When marking a report as "Resolved," the system requires an internal note explaining how it was handled.
- **History:** All status changes and staff notes are saved in the "Internal History" section of the report for future reference.

---

## Part 2: Technical Maintainer Guide (Engineers & DBAs)

### Database Schema

The reporting feature primarily interacts with the `Report` and `InternalNote` tables.

#### `Report` Table

- **Snapshots:** `orgNameSnapshot` and `serviceNameSnapshot` store the names at the time of creation. This is critical because the actual Organization name might change before a staff member reviews the report.
- **Enums:**
  - `ReportIssueType`: `CLOSED_INACTIVE`, `INCORRECT_INFO`, `TRANSLATION_QUALITY`, `SOMETHING_ELSE`.
  - `ReportStatus`: `PENDING`, `ACKNOWLEDGED`, `RESOLVED`.
- **Relationships:** Links to `Organization`, `OrgService`, `Language` (for translation issues), and `User` (both the reporter and the `handledBy` staff member).

#### `InternalNote` Table

- Used to store an audit trail of staff actions.
- When a `Report` status changes, the `mutation.update.handler.ts` automatically creates a record here linked via `reportId`.

### Backend Logic Flow

#### 1. Creation (`report.create`)

- **Handler:** `packages/api/router/report/mutation.create.handler.ts`
- **Behavior:**
  - Accepts public input (can be anonymous).
  - If the user is logged in, it connects the `reportedById`.
  - It uses `getAuditedClient` to ensure the creation is logged in the system's `AuditTrail`.

#### 2. Updates (`report.update`)

- **Handler:** `packages/api/router/report/mutation.update.handler.ts`
- **Permissions:** Restricted to `dataPortalManager` and above.
- **Behavior:**
  - Updates the `status` and `informed` boolean.
  - Automatically connects the `handledById` to the current staff member.
  - **Note Generation:**
    - If `internalNotes` are provided in the input, they are saved.
    - If the `status` changed but no text was provided, a system-generated note (e.g., "Status updated to RESOLVED") is created.
  - Wraps operations in a `$transaction` to ensure the report update and note creation succeed or fail together.

#### 3. Data Retrieval (`report.forReportsTable`)

- **Handler:** `packages/api/router/report/query.forReportsTable.handler.ts`
- **Feature: Deep Linking:**
  - The query accepts an optional `id` filter.
  - This is used by the `ReportTable.tsx` component to support URL parameters (e.g., `/admin?tab=reports&reportId=...`).
  - When a `reportId` is present in the URL, the handler filters for that specific record, and the UI automatically launches the `ReportDetailsModal`.

### Key Files

- **UI Components:** `packages/ui/components/core/ReportSubmit.tsx`, `packages/ui/components/data-portal/ReportTable.tsx`.
- **API Definition:** `packages/api/router/report/index.ts`.
- **Schemas:** `packages/api/router/report/*.schema.ts`.

### Maintenance Notes

- **Permissions:** Access is controlled via `permissionedProcedure('dataPortalManager')`. Ensure any new admin roles requiring report access are added to the `canAccessReports` check in `apps/app/src/pages/admin/index.tsx`.
- **Styling:** Status text coloring and aging logic is handled inside the `Cell` renderer of the `ReportTable` component using `Luxon` for date math. The colors represent the following states:
  - **Pending (Bold)**:
    - **Black**: New report (less than 24 hours old).
    - **Orange**: Needs attention (1–3 days old).
    - **Red**: Stale/High Priority (3+ days old).
  - **Acknowledged**:
    - **Blue**: Currently being handled by staff.
    - **Orange**: Stalled (has been in this state for 7+ days).
  - **Resolved**:
    - **Gray**: Completed and de-emphasized.

---
