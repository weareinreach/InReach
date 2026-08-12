# Tutorial: Traversing the Stack (The Detective Work)

## Summary

This guide is designed to help you build the "investigative mindset" required for software development. Instead of giving you the answers, we will walk through the **process** of finding the solution using the principles from "How to approach a code change".

## Prerequisites

Before diving in, it is highly recommended that you review all of the resources in the [Start Here documentation folder](./) to establish a baseline understanding of the technologies we use.

---

## The Mission (The Ticket)

**Context:** The product manager noticed inconsistent language regarding "Community Focus" badges on the Organization Profile page.

**Current State:**

1. The button says: "Add Community Focus Badge(s)".
2. The popup header says: "Edit Community Focus Badges".

**Desired State:**

1. Change button to: "Add Community Focus Badge(s)".
2. Change popup header to: "Edit Community Focus Badges".

---

## Phase 1: Understand & Reproduce

_Before touching code, you must confirm the issue._

1.  **Spin up the app:** Run `pnpm dev`.
2.  **Navigate:** Log in (or use a dev account), go to an Organization page, and enter **Edit Mode**.
3.  **Verify:** Find the button. Click it. Check the popup header.
    - _Mental Check:_ Do you see the inconsistencies? Good. Now you have a baseline.

## Phase 2: The Hunt (Locating the Code)

_We need to find where these strings live. They could be hardcoded in React, or they could be in a Translation JSON file._

### Strategy A: The "Ctrl+F" (Global Search)

This is usually the fastest way to find unique text.

1.  **Search for the Button Text:**

    - Open your editor's global search.
    - Search for: `"Add Community Focus Badge(s)"`.
    - _Question:_ Did you find it?
    - _Hint:_ You should see a result in `packages/ui/.../ListingBasicInfo.tsx`.

2.  **Analyze the Button Code:**

    - Open that file. Look at the code.
    - Is the text inside a `t('key')` function (Translation)?
    - Or is it a raw string (Hardcoded)?
    - _Decision:_ If it's hardcoded, you change it right there. If it's a translation key, you have to find the JSON file.

3.  **Search for the Popup Header:**
    - Search for: `"Edit Community Focus Badges"`.
    - _Scenario:_ Let's pretend you **didn't** find it. (This happens often with dynamic text like `Edit ${type} Badges`).
    - _Question:_ If you can't find the text, how do you find the code?

### Strategy B: Component Tracing

If text search fails, we trace the UI components.

1.  **Back to the Button:**
    - Look at the code in `ListingBasicInfo.tsx` where you found the button.
    - It's likely wrapped in or near a component that handles the "Edit" action.
    - Look for components like `<BadgeEdit>` or `<Modal>`.
2.  **Drill Down:**
    - You see `<BadgeEdit ... badgeType='service-focus'>`.
    - This looks suspicious. The header mentions "Service Focus", and the prop is `service-focus`.
    - **Action:** Go to the definition of `BadgeEdit` (Cmd+Click the component name).
3.  **Investigate the Child Component:**
    - Now you are in `packages/ui/modals/BadgeEdit/index.tsx`.
    - Look for the `<Title>` component (around line 61).
    - _Observation:_ You find a ternary operator: `` `Edit ${badgeType === '...' ? '...' : 'Community Focus'} Badges` ``.
    - _Conclusion:_ The text is hardcoded logic inside the component, not a simple string or translation key.

---

## Phase 3: Implementation

_Now that you've located the sources, make the changes._

1.  **Fix the Button:**

    - Since we found this in `ListingBasicInfo.tsx`, update the string directly.
    - _Challenge:_ Should you hardcode the new string, or is this a good time to extract it to a translation file? (For this tutorial, stick to the requested change, but note the tech debt).

2.  **Fix the Popup Header:**
    - Open `packages/ui/modals/BadgeEdit/index.tsx`.
    - Locate the ternary operator inside the `<Title>`.
    - Update `'Service Focus'` to `'Community Focus'`.

## Phase 4: Verification

_Never assume it works._

1.  **Check the UI:** Refresh the page. Does the button look right?
2.  **Check the Flow:** Click the button. Does the popup header look right?
3.  **Regression Test:** Did you accidentally break the "Leader Badges" or other badge types? (Since `BadgeEdit` might be shared).

---

## Summary of Concepts

- **Search First:** Global text search is your best friend for UI copy changes.
- **Trace Second:** When text is dynamic, follow the component tree (`Parent -> Child -> Props`).
- **Hardcoded vs. Translated:** Always check if text is wrapped in `t()`.
