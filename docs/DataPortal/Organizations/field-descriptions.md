# Field Descriptions (Help Text) for Org / Location / Service Forms

> **Status: Implemented.** All field copy below has shipped in code — see
> [Implementation](#implementation) for what was actually built and how the two open decisions
> below were resolved.

## Overview

Data Portal staff (including interns and volunteers doing intake/vetting) currently learn what each
form field means and how it affects the public site either by trial and error, by asking someone, or
from a separately-maintained internal guide ("Data Portal Instructions," a PDF maintained by the Data
Manager — see [Source material](#source-material)). This doc proposes adding that guidance inline, as
help text/tooltips on the fields themselves, so the knowledge travels with the form instead of living
in a separate document someone has to already know exists.

**Scope**: input fields on the Organization, Location, and Service edit surfaces (and the contact-method
drawers — Phone/Email/Website/Social Media — that hang off Organization). Does **not** cover the wider
Data Portal table/dashboard UI (Reviews, Reports, Downloads, Manage Users), which is a separate surface.

**Explicitly not translated.** The Data Portal is already exempted from i18n by established convention
(`i18next/no-literal-string` is disabled across Data Portal drawers/pages with the comment "Data Portal
is internal-only, no i18n needed" — e.g. `apps/app/src/pages/data-portal/organizations.tsx:36`). This
content follows that same convention: hardcoded English strings, not translation keys.

**"Genuinely helpful" means stating the actual downstream effect**, not restating the label. Every
entry below was written after tracing the field to its real public-facing consequence (a specific
display component, a specific search-query behavior, a specific visibility rule) — not from the field
name alone. Where that trace surfaced an existing internal policy (e.g. which orgs must have their
address hidden, which badges imply another), that policy is quoted directly rather than paraphrased.

## Source material

- The internal **"Data Portal Instructions"** guide (created 2024-08-07, last updated 2025-12-16),
  maintained by the Data Manager for interns/volunteers doing org vetting and data entry. It documents
  the actual vetting criteria this doc's copy draws from (badge parent/child rules, the address-hiding
  policy, coverage-area examples, the reverification questionnaire). It was supplied during this
  scoping discussion as a PDF, not as a repo file — worth considering whether a copy should be checked
  into this folder (or linked from it) so it isn't only reachable via whoever currently holds it.
- Codebase trace performed during this discussion (components, models, and query handlers cited inline
  below), covering how each field's value is actually consumed on public-facing pages.

## Implementation

Both decisions this doc originally left open were resolved as follows:

1. **Visual pattern — split by control type, not a single global choice.**
   - Real labeled inputs (`TextInput`/`Textarea`/`Select`/`Radio.Group`/`Checkbox`) use Mantine's
     native `description` prop directly — this activates the dormant
     `InputWrapper.module.css` styling mentioned below, with no new component needed.
   - Controls with no native label/description slot (badges, buttons, cards, section headings that
     are plain `Text`, not a real input) use a new shared component,
     `packages/ui/components/core/FieldHelp.tsx` — an info icon + hover `Tooltip`, generalizing the
     one-off `CreateMethodLabel` pattern in `OrganizationTable.tsx` into something reusable. Usage:
     `<FieldHelp help='...' />`, optionally with a `label` node placed before the icon.
2. **Reusable checkbox copy**: confirmed — the Published/Deleted copy is the same literal string in
   all five files (`ServiceEditDrawer`, `WebsiteDrawer`, `EmailDrawer`, `PhoneDrawer`,
   `SocialMediaDrawer`), passed as each `Checkbox`'s own `description` prop rather than deduplicated
   into a shared constant (five small, independent files; not worth an import for two strings).
3. **Organization-level Publish/Unpublish/Delete/Restore** (`Navbar.tsx`) are wrapped in a plain
   Mantine `Tooltip`, worded for a button-hover rather than a checkbox caption, as planned.

Where each entry from [Field copy](#field-copy) actually landed:

| Field                                                  | File                                                               | Mechanism                                                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Org name / description                                 | `ListingBasicInfo.tsx`                                             | `description` prop on the `InlineTextInput`                                                                         |
| Leader badges / Community badges                       | `ListingBasicInfo.tsx`                                             | `FieldHelp` next to the badge-edit trigger                                                                          |
| Org Publish/Unpublish/Delete/Restore                   | `Navbar.tsx`                                                       | `Tooltip` wrapping each button                                                                                      |
| Location (address field, under Visit)                  | `VisitCard.tsx`                                                    | `FieldHelp` next to the "Address"/"Location" title                                                                  |
| Address visibility, Wheelchair accessibility, Latitude | `AddressDrawer/index.tsx`                                          | `description` prop                                                                                                  |
| Services Available Remotely card                       | `LocationCard.tsx`                                                 | `FieldHelp` next to the card title, edit-mode only                                                                  |
| Service Name / Description                             | `ServiceEditDrawer/index.tsx`                                      | `description` prop on the `InlineTextInput`                                                                         |
| Service tags, Coverage Area                            | `ServiceEditDrawer/index.tsx`                                      | `FieldHelp` next to the section's `Text` label                                                                      |
| Service Published/Deleted                              | `ServiceEditDrawer/index.tsx`                                      | `description` prop on each `Checkbox`                                                                               |
| Additional attributes ("Add Attribute")                | `ServiceEditDrawer/index.tsx`                                      | Extended the existing conditional `Tooltip` to show help text when there are no unsaved changes, instead of nothing |
| Website/Phone/Email/Social Media Published/Deleted     | `WebsiteDrawer`, `PhoneDrawer`, `EmailDrawer`, `SocialMediaDrawer` | `description` prop on each `Checkbox`                                                                               |

## Field copy

### Organization level

| Field                                | Where it lives                                                                                 | Copy                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Org name                             | `ListingBasicInfo.tsx` (inline text field)                                                     | "Used to search for this organization on the public site — enter it exactly as the org presents itself (capitalization, acronyms)."                                                                                                                                                                                     |
| Org description                      | `ListingBasicInfo.tsx` (inline textarea)                                                       | "Shown on the org's public page — tells visitors about the communities the org serves and what it does. Combine who the org is with what it does, and include an LGBTQ+ affirming statement if the org isn't explicitly LGBTQ+."                                                                                        |
| Leader badges                        | `ListingBasicInfo.tsx` → `BadgeEdit` modal (`badgeType='organization-leadership'`)             | "Appears as a badge below the organization's name on its public page, alongside any Verified/Claimed badges. Select only leadership types that genuinely apply based on the vetting process — note some badges imply another: Black-led orgs should also get BIPOC-led, and Trans-led orgs should also get LGBTQ+-led." |
| Community / Focused Community badges | `ListingBasicInfo.tsx` → `BadgeEdit` modal (`badgeType='service-focus'`, org-level, no parent) | "Displayed as badges on the organization's page, just under the description. Tells visitors which communities the org focuses on serving — select all that genuinely apply based on the vetting process. (Sometimes labeled 'Service Focus Badges.')"                                                                   |
| Publish (button)                     | `Navbar.tsx` edit-mode bar                                                                     | "Publishing makes the organization's page live and searchable again immediately."                                                                                                                                                                                                                                       |
| Unpublish (button)                   | `Navbar.tsx` edit-mode bar, via `UnpublishReasonPopover`                                       | "Unpublishing takes the organization's page offline immediately — visitors get a 404 and it drops out of search — until it's published again."                                                                                                                                                                          |
| Delete (button)                      | `Navbar.tsx` edit-mode bar                                                                     | "Deleting removes the organization from the public site entirely, same effect as unpublishing, until it's restored."                                                                                                                                                                                                    |
| Restore (button)                     | `Navbar.tsx` edit-mode bar                                                                     | "Restoring brings the organization back to how it was before deletion — it still needs to be published to be publicly visible."                                                                                                                                                                                         |

### Location level

| Field                                   | Where it lives                            | Copy                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Location (address field, under "Visit") | Location page sidebar → address edit      | "This is the street address for this location, not the location itself — a location can exist with no public address at all. The location's own name/nickname is set separately, at the top of the page."                                                                                                                                                                |
| Address visibility                      | `AddressDrawer/index.tsx`                 | "Controls how much of this location's address the public can see. Hide to city/state (or fully hide, for remote-only orgs) when: the org has a trans or LGBTQ+ youth-focused badge, any of its services carry an abortion or trans-services tag, the org doesn't publish its own address (e.g. most DV shelters), or the org has specifically asked to keep it private." |
| Wheelchair accessibility                | `AddressDrawer/index.tsx` (`Radio.Group`) | "Shown on the location's public page. If you don't know, select 'No info' rather than guessing — contact the org directly to confirm rather than assume."                                                                                                                                                                                                                |
| Latitude / Longitude                    | `AddressDrawer/index.tsx`                 | "Auto-filled when you select an address from the suggestions — usually correct as-is. Use the map-distance check link to verify it before saving, especially for rural addresses, new buildings, or PO boxes where the auto-match can be off. This position drives both the map pin and how far away this location shows up in search."                                  |
| Services Available Remotely card        | `LocationCard.tsx` (remote-services card) | "Click this card to view or add more remotely-offered services. This card is the only way to manage remote services once at least one remote service already exists."                                                                                                                                                                                                    |

### Service level

| Field                 | Where it lives                                       | Copy                                                                                                                                                                                                                                                                                |
| --------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Service name          | `ServiceEditDrawer/index.tsx`                        | "Used to search for and identify this service. Lead with a verb describing what a user gets — e.g. 'Get free condoms,' not 'Condom distribution program.' Conveying what it does for someone matters more than matching the org's own program name."                                |
| Service description   | `ServiceEditDrawer/index.tsx`                        | "Shown on the service's public detail page — tells visitors what this service does. You can reuse the org's own language, adjusted from 'we' to 'they.'"                                                                                                                            |
| Service tags          | `ServiceEditDrawer/index.tsx`                        | "Categorizes the service for browsing and search. Some tags show a crossed-out icon because they're not visible to users yet — still apply them when they fit, so the data's ready once that tag goes live."                                                                        |
| Coverage Area         | `ServiceEditDrawer/index.tsx` → `CoverageArea` modal | "Optional — only use for services that exclusively serve people in specific areas, not ones open to anyone who shows up. Select every state/county covered; double-check before applying 'National,' since not every remote service actually serves the whole country."             |
| Additional attributes | `ServiceEditDrawer/index.tsx` → `AttributeModal`     | "Appears as a visible tag on this service's public listing, and lets visitors filter search results by it. Only add attributes that are accurate and currently true. Note: editing an existing attribute doesn't currently save correctly — delete it and add a fresh one instead." |

### Published / Deleted (reusable copy)

Applies verbatim everywhere this checkbox pair appears: `ServiceEditDrawer/index.tsx:388-389`,
`WebsiteDrawer/index.tsx:199-200`, `EmailDrawer/index.tsx:208-209`, `PhoneDrawer/index.tsx:391-392`,
`SocialMediaDrawer/index.tsx:248-249`.

| Field                | Copy                                                                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Published (checkbox) | "Unchecking this temporarily removes the entry from the public site and search. Use this when something's still being sorted out and you expect it to come back — re-verifying, waiting to hear back, or a temporary inactive period." |
| Deleted (checkbox)   | "Checking this removes the entry from the public site until deliberately restored. Use this when the entry shouldn't be active at all — a duplicate, permanently discontinued, or rejected during review — not for a temporary pause." |

## Known ambiguities / not fully resolved

- **The Unpublish/Delete distinction above is fully documented (schema comment + `OrgUnpublishedReason`
  enum + audit trail) only for Organization.** `OrgLocation` and `OrgService` share the identical
  boolean shape and instant-toggle UI, but have no reason-tracking and no doc/comment stating whether
  the same "temporary vs. terminal" intent is meant to apply. The copy above extends that intent to
  Location/Service by analogy, which is a judgment call made in this doc, not a pre-existing fact —
  worth flagging to whoever reviews this before it ships.
- **Attributes editing bug**: `[Note: Editing attributes does not yet work, instead delete the existing
attribute and create a new one]` (from the Data Portal Instructions guide) is a real product
  limitation, surfaced here as a workaround note rather than fixed. If it's fixed, this copy's last
  sentence should be removed.
- No copy was drafted for the location-level "Services available" (associate existing services to a
  location) field — deferred during scoping, not resolved either way.

## Related files

| Path                                                                                                                                          | Purpose                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `packages/ui/components/sections/ListingBasicInfo.tsx`                                                                                        | Org name/description, Leader/Community badge display + edit toggle                         |
| `packages/ui/modals/BadgeEdit/index.tsx`                                                                                                      | Leadership/Community-Focus badge assignment modal                                          |
| `packages/ui/components/sections/Navbar.tsx`                                                                                                  | Organization Publish/Unpublish/Delete/Restore edit-mode bar                                |
| `packages/ui/components/core/UnpublishReasonPopover.tsx`                                                                                      | Org-only unpublish-reason flow                                                             |
| `packages/ui/components/data-portal/AddressDrawer/index.tsx`                                                                                  | Address visibility, wheelchair accessibility, latitude/longitude                           |
| `packages/ui/components/sections/LocationCard.tsx`                                                                                            | Public location card, remote-services card                                                 |
| `packages/ui/components/data-portal/ServiceEditDrawer/index.tsx`                                                                              | Service name/description/tags, Published/Deleted, Coverage Area, Attributes                |
| `packages/ui/modals/dataPortal/Attributes/index.tsx`                                                                                          | Attribute assignment modal (`AttributeModal`)                                              |
| `packages/ui/components/data-portal/WebsiteDrawer/index.tsx`, `EmailDrawer/index.tsx`, `PhoneDrawer/index.tsx`, `SocialMediaDrawer/index.tsx` | Contact-method drawers sharing the Published/Deleted checkbox pattern                      |
| `packages/ui/components/sections/VisitCard.tsx`                                                                                               | Location-vs-Address distinction tooltip, on the address-edit trigger                       |
| `packages/ui/components/core/FieldHelp.tsx`                                                                                                   | New shared icon+tooltip component (see [Implementation](#implementation))                  |
| `packages/ui/theme/components/InputWrapper.module.css`                                                                                        | `description` prop styling, now in active use                                              |
| `packages/ui/components/data-portal/OrganizationTable.tsx`                                                                                    | Original one-off icon+tooltip precedent (`CreateMethodLabel`) that `FieldHelp` generalizes |
| `packages/db/prisma/schema.prisma`                                                                                                            | `OrgUnpublishedReason` enum + doc comment (Organization only)                              |
| `docs/DataPortal/2026-Redesign/organization.md`                                                                                               | Broader Organization-table backlog this doc's scope sits alongside                         |

---

_Last verified against code: 2026-09-07. Implemented same-day as this doc's scoping discussion. Update
this doc's Related Files and Known Ambiguities if the description-copying bug, the Location/Service
unpublish-vs-delete distinction, or the location-level "Services available" field get addressed later._
