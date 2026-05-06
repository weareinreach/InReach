# GTM & GA4 Troubleshooting Summary

## The Issue: "The Privacy Tax"

Since late 2023/early 2024, Google and modern browsers (Safari/Firefox) have hardened tracking requirements. Even if code is firing, GA4 may discard events if an explicit consent signal is missing. This results in a "drop" in event counts (like filters) even if total sessions remain relatively stable.

## 1. Checking GTM Configuration

To ensure GTM is correctly processing your application's signals, log into [tagmanager.google.com](https://tagmanager.google.com) and verify:

1.  **Triggers:** Ensure there is a **Custom Event** trigger for every event name sent by the code.
    - _Reference:_ Find the list of events in `packages/analytics/events/index.ts`. Look for the first argument in `event('event_name', ...)` calls.
    - _Check:_ Does the "Event name" in GTM match the string in the code exactly?
2.  **Tags:** Ensure there is a **GA4 Event Tag** linked to that trigger.
    - _Check:_ Is the Measurement ID correct (`G-Y3MGLFJVJH`)?
    - _Check:_ Are "Event Parameters" (like `service_name`, `item_id`) mapped to **Data Layer Variables** in the GTM configuration?
    - _Check:_ Is the event name under 40 characters? (See `packages/analytics/lib/event.ts`)
3.  **Consent Settings:** Check the **Consent Overview** in Admin.
    - _Check:_ Are tags set to "No additional consent required" or are they waiting for a signal?

## 2. Analyzing Data Drops (The "Ratio" Check)

To determine if a drop in numbers is a tracking bug or just lower traffic, compare the **Event Count** of `session_start` against your custom events (e.g., `service_filter_select`).

- **Normal:** Both counts drop by roughly the same percentage (e.g., -30%).
- **Tracking Bug:** Custom events drop significantly more than sessions (e.g., -34% sessions vs -62% filters). This indicates Google is "ignoring" interaction data due to missing consent signals.

### Reconciling Event Counts (Code vs. Dashboard)

If the GA4 dashboard shows more event names (e.g., 27) than are defined in `packages/analytics/events/index.ts` (e.g., 14), this is normal. "Extra" events come from:

- **GA4 Automatic:** `session_start`, `first_visit`, `user_engagement`, `page_view`.
- **Enhanced Measurement:** `scroll`, `click` (outbound), `file_download`, `view_search_results`.
- **Web Vitals:** The `appEvent.webVitals` function sends 6 separate event names based on the metric provided by Next.js (`FCP`, `LCP`, `CLS`, `FID`, `TTFB`, `INP`).
- **Legacy Data:** GA4 reports show all events that occurred within the selected date range, even if the code has since been removed.

## 3. Verifying Changes

Use these three tools to confirm data is flowing:

1.  **GTM Preview Mode:**
    - Click **Preview** in GTM and connect your site.
    - Trigger an action (e.g., click a filter).
    - In Tag Assistant, click the event name and check the **Consent** tab. It must show **Granted** for data to reach GA4.
2.  **Browser Network Tab:**
    - Open Inspect > Network. Filter by `collect?v=2`.
    - **GCS Parameter:** `gcs=G111` is Granted. `gcs=G100` or `G110` is Denied.
    - **GCD Parameter (V2):** Look for `gcd=`. A value ending in `5` (e.g., `11p1p1p15`) means granted. A `0` or `r` in the middle (e.g., `11p0p0p05`) indicates a deny signal.
3.  **GA4 DebugView:**
    - Go to GA4 Admin > Data Display > DebugView.
    - Events should appear here in real-time while you are in GTM Preview mode.

## 4. Resolving the "Denied" State

The most effective way to restore data accuracy is re-enabling the **Consent Banner**. This provides the explicit `gtag('consent', 'update', ...)` command that unlocks GA4's ability to record detailed interaction data.

**File Location:** `apps/app/src/providers/index.tsx`
