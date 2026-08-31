# 2026 Data Portal Design Update Notes

## Summary

This captures the agreed design direction for the Data Portal's shared page/table template, arrived at
by comparing the Figma redesign ("[WIP] New Data Portal Layout") against the current implementation
(`OrganizationTable.tsx`, `UserTable.tsx`, the `/admin` dashboard shell) and then working through several
rounds of decisions where there are deviations from the Figma design in order to keep the
resulting UI consistent across tables.

**Scope**: this is a UI/layout template spec — header chrome, page structure, toolbar shape, table
columns-of-convention, and the Saved Views interaction. It does **not** cover backend/data-model gaps
(e.g., organization claim status having no stored "pending" state, the Teams feature having no schema at
all, service-area/community-focus filters not being wired into any query).

## Implementation Constraints for This Pass

This section is the boundary between the full target design described below and what actually ships in
this specific pass. Everything above and below should be read through it.

- **No new backend functionality.** This pass applies the new layout and structure to the Data Portal's
  currently-existing tables. It does not add new schema, new models, or new API endpoints — with one
  explicit exception, below.
- **All current functionality must keep working.** Nothing that works today (search, sort, filter,
  publish/unpublish, hide/unhide, etc.) should regress as part of relayouting.
- **Anything without existing backend support renders visible but disabled — never hidden, never
  omitted.** This is a blanket rule, not scoped to any one tab. It covers, at minimum: the entire Saved
  Views feature except the fixed "System Default" entry (no schema exists for a saved view at all —
  add-new-view, the save icon, and the per-view default star are all disabled); the Service-type
  quick-filter on Organizations and the Data-entry-teams quick-filter on Manage Users (no query support
  exists for either); any bulk action beyond what already exists as a per-row action today; the entire
  Tasks top-level nav section; and Manage Teams / Properties Manager within Admin's side-nav. Two separate
  reasons can put a control in this state — the backend doesn't exist at all (grayed out for everyone,
  regardless of permission), or the backend exists but the signed-in user's permission tier doesn't meet
  the threshold (grayed out for that user only). Both render the same way: visible, disabled, not hidden.
- **One explicit exception is approved for this pass**: the Reports permission split (see "Section &
  Side-Nav Structure for This Pass" below) — splitting an existing endpoint's over-strict permission
  requirement counts as fixing existing broken behavior, not as new functionality, and is in scope.
- **Out of scope, deliberately**: the root/superuser permission-detection issue raised during this design
  work is a separate, real defect, not addressed by anything in this document.
- **Consumer header/footer stay, for now.** The app-wide consumer `Navbar` and `Footer` continue to wrap
  `/admin` exactly as they do today. The new gray Data-Portal header bar stacks directly below the
  existing Navbar rather than replacing it: consumer Navbar → new gray bar → page heading → content →
  consumer Footer. Fully removing the consumer chrome from Data Portal pages remains the eventual target;
  it's deferred for this pass, not abandoned.
- **Two-phase rollout within this pass.** Phase A: move the routing/URL structure and the shared chrome
  (gray bar, Side Nav, page heading, result-count line) into place, with each existing table (Organizations,
  Reviews, Reports, Downloads, Manage Users) dropped into the new shell exactly as it works today — no
  column/toolbar changes; Manage Users keeps its current Actions column as-is. Phase B, only once Phase A
  is proven working end to end, layers in the new table-level elements (quick-filter dropdowns, the
  leading status-indicator column, bulk-select, Saved Views) with the grayed-out-when-unbacked rule
  applying as each one lands. This keeps routing/shell risk separate from table-feature risk instead of
  debugging both at once. See "Suggested Build Order" below for the concrete sequence.

## The Data Portal Table Template — what already exists in code

Pieces already built and working, which the template below extends rather than replaces:

- **`DataTable`** ([`packages/ui/components/data-portal/DataTable/index.tsx`](../../../packages/ui/components/data-portal/DataTable/index.tsx)) — the shared table engine used by every `/admin` tab today (`OrganizationTable`, `UserTable`, `ReviewTable`, `ReportTable`, `DownloadTable`). Already provides: server-side sort/filter/pagination, per-column filter popovers (date-range, multi-select), a column show/hide menu, and pinned/non-hideable columns (`hideable: false`, currently used for the Actions and Name columns).
- **Toolbar extension slot** — `OrganizationTable` already passes a `toolbarExtra` node into `DataTable` for its published/deleted icon toggles. The mechanism for adding table-specific controls into a shared toolbar already exists; it just isn't used for labeled dropdown filters yet (see below).
- **Pagination footer** — already built: "Showing X–Y of Z" + a rows-per-page selector + a Mantine `Pagination` control.
- **Reusable drawers** — `AuditDrawer`, `InternalNotesDrawer`, `LocationDrawer`, `ServiceEditDrawer`, `AddressDrawer` establish an existing "open a drawer, list/edit related records" pattern usable by future template pieces (e.g. a Team roster).

What's **not** part of the shared template anywhere in code today: a Data-Portal-specific header/nav bar, a per-tab page-title+action row, a result-count line, a side navigation component, a saved-views capability, bulk row-selection, or a dedicated leading status-icon column convention. Everything in the next section is net-new.

## Needed changes to the template

1. **Data-Portal header bar.** A new, dedicated persistent bar for the Data Portal specifically, showing the top-level sections (Tasks / Organizations / Admin / System), in that order, with the active one indicated. It carries no user-identity display of its own — the existing avatar/dropdown in the consumer `Navbar` above it (see "Implementation Constraints for This Pass") already covers that, and repeating it here would just be visual clutter.

2. **Page heading row.** Title text on the left; an optional primary action button on the right, same row. Shared shape, per-page content: "Add new organization" on Organizations, "Add new team" on Manage Teams, "Add task" on the Task views — moved here from the bottom of the Task views' Side Nav for consistency with the other two, and to keep Side Nav a pure navigation element.

3. **Result-count line** ("Total: N") sitting above the toolbar — a template-level feature any table can opt into, not table-specific.

4. **Toolbar quick-filters.** Extend the existing icon-toggle-only toolbar (today: published/deleted cycling icons on Organizations) to also support labeled dropdown quick-filters — e.g. Publish Status / Service type on Organizations, Data entry teams on Users — configured per table rather than hardcoded per component.

5. **Leading status-indicator column.** A dedicated per-row icon column immediately after the bulk-select checkbox, separate from the primary name/label cell — e.g. an unpublished indicator on Organizations, an active/verified indicator on Users. Today this is embedded inside the Name cell on Organizations and doesn't exist at all on Users.

6. **Bulk row-selection + contextual bulk-action toolbar.** A checkbox column plus a "…" bulk-action menu, needed on both Organizations and Users. Neither has it today — a prior, unused version existed on Organizations and was intentionally not carried over in the server-side rewrite.

7. **Side Nav component.** A shared, parameterized left-nav (a section label + a list of links) — confirmed used identically by both the Admin area and every Task (Admin View) screen checked (Pending Claims, Review Suggestions, Approve Changes, Unassigned/Table View), differing only in heading label ("Admin" vs. "Tasks") and which links populate it. Organizations gains this same component as a third consumer — Figma doesn't show it there, but it's the same shared piece, not a new one. Per the "Add task" relocation below, this component should render as heading + links only, with **no** trailing action button — removing the divider+button variant that only some Task-view instances currently have.

8. **Saved Views**, full spec:
   - A per-table opt-in capability (a `DataTable` feature flag), not built as an Organizations-only feature — simpler tables (e.g. Manage Teams) may reasonably leave it off.
   - A **"Change view" dropdown**, not a tab strip — scales to any number of saved views without wrapping/overflow, unlike a tab strip once a table accumulates more than a handful of views. Sits on its own row, **above** the search/filter row (so "which view am I in" is established before its filter state is shown, not after).
   - A small dirty-state **save icon** next to the dropdown, enabled only when the live table state (column visibility/order/width, filters, sort) differs from the currently-loaded view's saved definition.
   - **System Default** is a permanent, undeletable, always-listed first entry in the dropdown. It can never be overwritten — editing it and saving always creates a new named view, prompting for a name at that moment.
   - Editing a **named** (non-default) view and saving offers a real choice: update it in place, or save as a new view.
   - Each row in the "Change view" list carries its own **star** affordance for "make this my personal default," independent of the row's click-to-switch target. Setting a new default silently un-stars whichever view was previously flagged — no confirmation needed, since it's a low-stakes, reversible preference.
   - **View-loading precedence** for a returning user: personal default (if set) → last view used (if no personal default set) → System Default (first visit, nothing set yet).

## Section & Side-Nav Structure for This Pass

**Routing.** The Data Portal moves from `/admin` to a new `/data-portal` route root — `/admin` is also the name of one of the top-level nav sections (Tasks / Organizations / Admin / System), so keeping the route root as `/admin` would produce a confusing `/admin/admin/manage-users`-style collision. The nav order is Tasks, Organizations, Admin, System, but the default landing destination on `/data-portal` stays **Organizations**, matching current behavior — Tasks has no destination page at all in this pass (see "Tasks" below), so it can't be the default view even though it's listed first. URLs stay flat, one level deep, regardless of Side Nav grouping: `/data-portal/organizations`, `/data-portal/reviews`, `/data-portal/reports`, `/data-portal/downloads`, `/data-portal/manage-users`, `/data-portal/manage-teams`, `/data-portal/properties-manager`, `/data-portal/tasks`. Side Nav grouping (which items appear together under which section heading) is a UI concern only — it doesn't need to be reflected in URL nesting, and keeping URLs flat means a future change to that grouping doesn't require a redirect. **Quicklink is the one exception**: it keeps its existing nested routing structure as-is (`/admin/quicklink/{index,phone,email,services}` becomes `/data-portal/quicklink/{index,phone,email,services}`), since its three sub-pages are tightly coupled to Quicklink specifically and aren't at risk of being regrouped elsewhere the way Reviews/Reports/Downloads might be — there's no future-redirect risk to protect against by flattening them.

**Tasks** — a single top-level nav link, disabled/unclickable in this pass. No Task data model exists, so no destination page is built for it this round — it exists in the header bar only as a placeholder for future work.

**Organizations** — the top-level section contains the Organizations table itself, plus a side-nav with Reviews, Reports, and Downloads. All four are real, existing, and clickable in this pass:

- **Reviews** — Basic+ can open the table and hide/unhide entries; Manager+ required for delete/undelete. Matches the intended tiering in code today — no permission change needed, just relocating the tab.
- **Reports** — Basic+ can view the table; Manager+ required to take action on a report (change status, add a note, resolve). This is the approved exception from "Implementation Constraints" above: today both the list query and the update action require the same `dataPortalManager` threshold, so Basic-tier staff can't even view the list — the view-side needs to be split to resolve at Basic, leaving the action/mutate-side exactly as Manager+.
- **Downloads** — Manager+ required to open the view and download a CSV. The underlying access already enforces this correctly; the current tab gate is stricter than that (Admin+) and should be corrected to Manager+ when relocated — a frontend permission-check fix, not a backend change. Downloads remains an explicit stopgap, not a permanent feature: it exists only until Organizations supports direct search/export and the Task system covers assignment/tasking, and is expected to be retired in favor of an export action on the Organizations table and/or a future Director's Dashboard view.

**Admin** — the top-level section's side-nav has three links, only one of which is clickable in this pass:

- **Manage users** (renamed from the current "Users" tab) — clickable, fully functional, same behavior as today.
- **Manage teams** — disabled. No `Team` model or schema exists at all.
- **Properties manager** — disabled. No equivalent exists anywhere in the codebase, and its scope is still undetermined (see Open Questions).

**System** — a 4th top-level nav section, grayed out for anyone who isn't `root` (no exception carved out from the general permission rule below — root-only sections follow the same visible-but-disabled treatment as everything else). Its side-nav has a single item, **Quicklink**, which drops in the existing Quicklink tool completely unchanged, including its own internal tab bar (Phone Numbers / Email Addresses / Location Services) — no conversion to the new Side Nav pattern for those three, just a relocation of the entry point and route root (see "Routing" above).

**General side-nav permission rule**: within a clickable item, whether a given action is enabled is governed purely by the plain `dataPortalBasic` / `dataPortalManager` / `dataPortalAdmin` ladder — no bespoke, per-action permission strings gate visibility or click-ability.

## Suggested Build Order

**Phase A — prove the shell and routing:**

1. Rename `/admin` to `/data-portal` and stand up the flat route structure described above.
2. Build the shared chrome in isolation first — gray header bar, Side Nav, page heading row, result-count line — validated via Storybook before wiring to any live page.
3. Wire the navigation skeleton: Organizations and Admin as top-level sections with their Side Nav items, Tasks as the permanently-disabled link, Manage Teams and Properties Manager as disabled placeholders.
4. Drop each existing table into the new shell exactly as it works today, no functional changes — Reviews, Downloads, Reports, Manage Users (keeping its current Actions column), Organizations, and Quicklink (under the new System section, internal tab bar untouched). This is the point at which routing and shell issues surface, independent of any table-feature work.

**Phase B — layer in the new table-level elements, only once Phase A is proven working end to end:**

5. Extend `DataTable` with the net-new capabilities — toolbar quick-filter dropdowns, the leading status-indicator column, bulk-select + contextual "…" menu, and the (mostly-disabled) Saved Views shell — as additive/opt-in props so tables not yet touched are unaffected.
6. Apply the approved Reports permission split.
7. Roll the new elements out per table, applying the grayed-out-when-unbacked rule as each one lands.
8. Regression pass across all permission tiers, then update the five per-tab reference docs (`Organizations/README.md`, `Users/README.md`, `Reviews/README.md`, `Reports/README.md`, `Downloads/README.md`) with their new reality and bumped "Last verified" dates.

## Open Questions

- Rename/delete actions for a saved (non-default) view are assumed to exist but haven't been designed.
- Figma's Admin side-nav includes a "Properties manager" link with no equivalent anywhere in the current
  codebase (confirmed via full-repo search) — its scope and purpose are undetermined.

## Reference

Figma file: ["\[WIP\] New Data Portal Layout"](https://www.figma.com/design/449Snk9R17VyIlRWH4c42F/-WIP--New-Data-Portal-Layout?node-id=62-2279&p=f&t=By2NNAyc5qixnovw-0)

This file is a reference starting point, not a literal spec. Where this document and the Figma file
disagree, this document reflects the current decision; the Figma file has not necessarily been updated
to match.

## Related Files

| Path                                                                                                                                                                                                                  | Purpose                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`packages/ui/components/data-portal/DataTable/`](../../../packages/ui/components/data-portal/DataTable/index.tsx)                                                                                                    | Shared table engine — where most of the template additions above would live                                                                      |
| [`packages/ui/components/data-portal/OrganizationTable.tsx`](../../../packages/ui/components/data-portal/OrganizationTable.tsx)                                                                                       | Current closest-to-template implementation; toolbar-extension pattern to build on                                                                |
| [`packages/ui/components/data-portal/UserTable.tsx`](../../../packages/ui/components/data-portal/UserTable.tsx)                                                                                                       | Second consumer of the template; currently lacks bulk-select and the toolbar dropdown pattern entirely                                           |
| [`packages/ui/components/sections/Navbar.tsx`](../../../packages/ui/components/sections/Navbar.tsx)                                                                                                                   | The consumer-facing header — stays in place above the new Data-Portal gray bar for this pass; a separate component, not an extension of this one |
| [`apps/app/src/pages/admin/index.tsx`](../../../apps/app/src/pages/admin/index.tsx)                                                                                                                                   | Current `/admin` shell — flat tab bar, no side-nav, no per-tab title                                                                             |
| [`packages/ui/components/data-portal/AuditDrawer.tsx`](../../../packages/ui/components/data-portal/AuditDrawer.tsx), [`InternalNotesDrawer.tsx`](../../../packages/ui/components/data-portal/InternalNotesDrawer.tsx) | Existing drawer pattern to extend for future template pieces (e.g. a Team roster)                                                                |
| `packages/api/router/report/index.ts`                                                                                                                                                                                 | Reports router — `forReportsTable` and `update` currently both require `dataPortalManager`; the view-side needs splitting to Basic+              |
| `packages/api/router/review/index.ts`                                                                                                                                                                                 | Reviews router — hide/unhide vs. delete/undelete tiering, already correct                                                                        |
| `packages/api/router/csvDownload/index.ts`                                                                                                                                                                            | Downloads router — already correctly Manager+ server-side; only the `/admin` tab gate needs correcting to match                                  |
| [`docs/DataPortal/Reports/README.md`](../Reports/README.md), [`Reviews/README.md`](../Reviews/README.md), [`Downloads/README.md`](../Downloads/README.md)                                                             | Current-state reference docs for these three tabs                                                                                                |
