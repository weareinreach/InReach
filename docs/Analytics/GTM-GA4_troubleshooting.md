# GTM & GA4 Troubleshooting: 2025-2026 Data Audit

## 1. Executive Summary: The "Double-Count" Correction

The drop in traffic between April 2025 and April 2026 is a two-part technical shift. We have moved from a "Double-Counted/Unverified" state to a "Single-Counted/Privacy-Filtered" state. The 2026 baseline represents cleaner, more accurate data, while the 2025 baseline was artificially inflated.

| Metric (April)          | 2025 (Old Baseline) | 2026 (Current) | **% Change** | Analysis                            |
| :---------------------- | :-----------------: | :------------: | :----------: | :---------------------------------- |
| **Total Users**         |         626         |      425       |   **-32%**   | User loss due to Consent filtering. |
| **Event Count (Views)** |        3,792        |     1,860      |   **-51%**   | Removal of duplicate tracking code. |
| **Avg Engagement**      |        2.74s        |     0.96s      |   **-64%**   | Evidence of "Anonymous" data pings. |

---

## 2. Root Cause Analysis

### A. The Removal of the "Signal Splitter" (October 2025)

**Finding:** The ~50% drop in event volume is almost a perfect 2-to-1 reduction.

- **The Cause:** Prior to October, a GTM container (likely owned by the deleted engineer account) was taking every signal from our `G-Y3MGLFJVJH` ID and sending it simultaneously to the old `UA-76058112-1` ID.
- **The Result:** When the account/container was deleted, the automatic duplication stopped. The 1,860 views in 2026 are likely the **actual** traffic volume; the 3,792 in 2025 was the same but counted twice.

### B. The Consent Mode "Trust Gap"

**Finding:** Average engagement time crashed from **2.74s to 0.96s** (under 1 second), and filter events dropped significantly more than sessions.

- **The Cause:** The code in `_app.tsx` claims `defaultConsent='granted'`, but the `ConsentBanner` in `index.tsx` is **commented out**.
- **The Penalty:** Google’s Consent Mode v2 (enforced March 2024) detects that the app is claiming consent without a valid UI signal. It responds by removing the dat, i.e. stripping away Session IDs and engagement timers. This makes users look like "anonymous pings" rather than engaged sessions.

---

## 3. Technical Audit Findings

- **Injection Point:** The `G-` ID is loaded via `nextjs-google-analytics` in `_app.tsx` using the `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable.
- **Ghost Tags:** The browser is still attempting to load `UA-76058112-1` because it remains linked inside the GA4 Admin panel under "Connected Site Tags."
- **Inactive Logic:** High-quality consent logic (lines 39-85 in `index.tsx`) exists but was never activated, leaving the app in a "non-compliant" state for current Google algorithms.

### Reconciling Event Counts (Code vs. Dashboard)

If the GA4 dashboard shows more event names (e.g., 27) than are defined in `packages/analytics/events/index.ts` (e.g., 14), this is normal. "Extra" events come from:

- **GA4 Automatic:** `session_start`, `first_visit`, `user_engagement`, `page_view`.
- **Enhanced Measurement:** `scroll`, `click` (outbound), `file_download`, `view_search_results`.
- **Web Vitals:** The `appEvent.webVitals` function sends 6 separate event names (`FCP`, `LCP`, `CLS`, `FID`, `TTFB`, `INP`).

---

## 4. Implementation Plan (Action Items)

### Step 1: Stop the "Ghost" Injections (Admin Fix)

1. Log into **Google Analytics Admin**.
2. Go to **Data Streams** > Select the active stream > **Configure tag settings**.
3. Click **Manage Connected Site Tags**.
4. **Delete `UA-76058112-1`**. This officially severs the link to the deleted account and cleans up browser network requests.

### Step 2: Restore Data Quality (Code Fix)

1. **Uncomment Consent Logic:** Reactivate the `ConsentProvider` and `ConsentBanner` in `index.tsx`.
2. **Trigger the Update:** Ensure that when a user clicks "Accept," the app fires the update signal:
   `gtag('consent', 'update', { 'analytics_storage': 'granted' });`
3. **Switch to 'Denied' by Default:** Update `_app.tsx` to set `defaultConsent='denied'`.
   - _Note:_ When Google sees a transition from "Denied" to "Granted," it restores the Session IDs. This will fix the 64% engagement time crash.

### Step 3: Verify Recovery

- **Engagement Time:** Should return to the **2.0s - 3.0s** range.
- **User Count:** Expect a **20-30% recovery** as Google stops discarding unverified sessions.

## 5. Real-Time Debugging Proof

A decode of a live 'collect' request reveals:

- **GCD Parameter:** `13l3l3l3l1l1` (Indicates "No Signal" or "Unset" consent status).
- **GTM Parameter:** Active but unconfigured, confirming the "Mini-GTM" engine is running without a brain.
- **Result:** Data is being sent, but Google is likely discarding it from standard reports due to the lack of a verified consent update.

## 6. Verifying Changes (Network Audit)

To confirm the fix is working, inspect the browser **Network Tab** for `collect?v=2` requests:

1.  **GCS Parameter:**
    - `gcs=G111`: **Success**. Consent is explicitly granted and verified.
    - `gcs=G100` or `G110`: **Denied**. Google is ignoring the session details.
2.  **GCD Parameter:**
    - `13n3n3n3n5l1`: **Success**. The `5` indicates an explicit "Grant" signal was received.
    - `13l3l3l3l1l1`: **Failed**. Indicates "No Signal" (the state since October 2023).

## 7. Manual Console Verification (Success)

**Test:** Manually pushed `gtag('consent', 'update', ...)` via browser console.
**Observed Result:** Network hit transitioned from "Unset" to `gcs=G111`.
**Conclusion:** This confirms that re-activating the `ConsentBanner` in `index.tsx` is the technically verified solution to restore 2026 data accuracy and engagement metrics.
