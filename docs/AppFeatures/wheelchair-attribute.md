# Wheelchair Accessibility Attribute

## Overview

This feature lets Data Portal staff record whether a specific physical **location** is wheelchair accessible, and shows that answer to the public. It is scoped to the location — not the organization as a whole, and not to an individual service. An organization with several locations can have a different answer for each one.

## Access

- **View**: Public. No login required — visible on the public-facing org/location pages.
- **Edit**: Restricted to staff with the `updateLocation` permission, via the location edit drawer.
  - **Gotcha**: the compact edit-mode summary card (`VisitCardEdit`, used for single-location orgs) instead loads its data under the `createNewLocation` permission — a different permission than the one actually required to open the drawer and save a change (`updateLocation`). Both gate the same underlying capability today, but they aren't defined consistently. See [Known Issues / Gotchas](#known-issues--gotchas).

## How It Works

- **UI (edit)**: `packages/ui/components/data-portal/AddressDrawer/index.tsx` — the "Is this location wheelchair accessible?" radio group (Accessible / Not accessible / No info), part of the larger location-edit drawer.
- **UI (public display, single-location orgs)**: `packages/ui/components/sections/VisitCard.tsx` — renders a badge in the "Visit" section, for organizations that have exactly one published location (no location card is shown for these).
- **UI (public display, multi-location orgs)**: `packages/ui/components/sections/LocationCard.tsx` — renders a badge directly on each location's card, for organizations with more than one published location.
- **API (load into edit form)**: `location.getAddress` → `packages/api/router/location/query.getAddress.handler.ts`.
- **API (save)**: `location.update` → `packages/api/router/location/mutation.update.schema.ts` (validates/transforms) → `mutation.update.handler.ts` (persists).
- **API (public/edit display reads)**: `location.forVisitCard`, `location.forVisitCardEdits`, `location.forLocationCard` handlers in the same directory.
- **Data**: `OrgLocation.attributes` — a generic `AttributeSupplement[]` join (`packages/db/prisma/schema.prisma`), pointed at the `Attribute` row tagged `wheelchair-accessible`. The join row's `boolean` field holds the actual answer.

Things a reader would not expect from skimming one file:

- **No row = unset, not "no."** If nothing has ever been chosen, there's simply no `AttributeSupplement` row. Choosing "Not accessible" still creates a row (with `boolean: false`) — so code reading this attribute must check the `boolean` value, not just whether a row exists. (A location shown as "Accessible" purely because a row existed, regardless of its `boolean` value, was an actual bug fixed during this work.)
- **Which UI a location gets depends on its organization's location count**, not on anything about the location itself: exactly one published location → `VisitCard`/`VisitCardEdit`; more than one → `LocationCard` per location.
- **The edit form's radio buttons use text values** (`'true'` / `'false'` / `'null'`), but the API returns a real boolean or `undefined`. `AddressDrawer` converts between the two when loading the form — this conversion was previously missing, which meant the saved value never displayed as selected when reopening the drawer.

## How to Use It

**For staff (editing):**

1. Open the location's edit drawer.
2. Scroll to the address section, below "Check distance to address on Google Map."
3. Under "Is this location wheelchair accessible?", choose **Accessible**, **Not accessible**, or **No info**.
4. Click **Save**.

**For visitors (viewing):**

- On an organization page with only one location, look in the **Visit** section, below the address — a badge shows "Accessible" or "Not Accessible" if a value has been set (nothing shows if it's still unset).
- On an organization page with multiple locations, each location's own card shows the same badge directly on the card.

## Known Issues / Gotchas

- **No organization-level display exists.** This attribute is never shown at the organization level — not in search results, not on the main organization overview page. It only ever appears nested under a specific location's card. Adding that would be a new feature, not a bug fix.
- **Permission mismatch** between the drawer's load/save gate (`updateLocation`) and `VisitCardEdit`'s summary-load gate (`createNewLocation`) — see [Access](#access). Worth reconciling if a role is ever meant to have one capability but not the other.
- **A duplicate, legacy edit drawer exists** at `packages/ui/components/data-portal/AddressDrawer/hookform.tsx` (built on `react-hook-form-mantine`; its own in-code comment calls it "quick 'n dirty"). It is not imported or rendered anywhere in the app. It was kept type-compatible during this work only so the package continues to build — it is not part of the live edit flow.

## Related Files

| Path                                                              | Purpose                                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `packages/db/prisma/schema.prisma`                                | `OrgLocation.attributes` relation; `Attribute`/`AttributeSupplement` models |
| `packages/api/router/location/query.getAddress.handler.ts`        | Loads the current value into the edit form                                  |
| `packages/api/router/location/mutation.update.schema.ts`          | Validates/transforms the save payload (`accessible.boolean`)                |
| `packages/api/router/location/mutation.update.handler.ts`         | Persists the change                                                         |
| `packages/api/router/location/query.forVisitCard.handler.ts`      | Public display data, single-location orgs                                   |
| `packages/api/router/location/query.forVisitCardEdits.handler.ts` | Edit-mode display data, single-location orgs                                |
| `packages/api/router/location/query.forLocationCard.handler.ts`   | Display data for each location card, multi-location orgs                    |
| `packages/ui/components/data-portal/AddressDrawer/index.tsx`      | Edit form UI, including the radio group                                     |
| `packages/ui/components/sections/VisitCard.tsx`                   | Renders the badge for single-location orgs (public + edit)                  |
| `packages/ui/components/sections/LocationCard.tsx`                | Renders the badge for multi-location orgs                                   |
| `apps/app/public/locales/en/attribute.json`                       | Translation strings ("Accessible" / "Not Accessible")                       |
| `apps/app/public/locales/en/common.json`                          | Translation strings for the descriptive caption text                        |

---

_Last verified against code: 2026-08-11. If you change any file listed above, update this doc in the same PR and bump this date._
