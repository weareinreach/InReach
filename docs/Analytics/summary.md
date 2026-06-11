# Analytics Overview

InReach uses Google Analytics 4 (GA4) to understand how users interact with the platform. This data helps us improve search accuracy, identify missing services, and ensure the app is performing well.

## Our Tracking Philosophy (Post-2024 Updates)

### Simply Explained (Non-Technical)

We follow a "Privacy First" approach. When you first visit InReach, we don't track your specific actions until you give us permission via the **Cookie Banner**.

- **If you click "Accept":** We can see how you use the site (e.g., which filters you pick) to make the app better.
- **If you don't click anything:** We still see that a person visited, but we don't know what you did. This keeps your data private while giving us a rough idea of how many people use the site.

### Technically Explained (Engineering)

Tracking is handled via **Direct Injection** of the Google Tag (`gtag.js`) inside the Next.js application. We do not use an external GTM container, ensuring all tracking logic is version-controlled in the codebase.

- **Consent Mode v2:** We default `analytics_storage` to `denied` in `_app.tsx`.
- **Explicit Update:** We use `react-hook-consent`. When a user accepts, we fire a `gtag('consent', 'update', ...)` command.
- **Data Recovery:** This explicit transition from "Denied" to "Granted" is required by Google's latest algorithms to restore Session IDs and Engagement Timers, which are otherwise stripped from the data stream.

## General Application Tracking

Below is a comprehensive list of the specific user actions and interactions we track to improve the InReach experience.

### User Actions (Manual Click Events)

| Click Event                                                   | What triggers this?                                                                      |
| :------------------------------------------------------------ | :--------------------------------------------------------------------------------------- |
| **Search by Location** (`search`)                             | User enters a city or ZIP code to find nearby resources.                                 |
| **Search Performance** (`search_executed`)                    | Fired when a search is successfully initiated, capturing location and demand data.       |
| **Search for Organization** (`orgSearch`)                     | User types an organization's name directly into the search bar.                          |
| **Zero Results** (`search_zero_results`)                      | Fired when a search query returns no results (critical for identifying coverage gaps).   |
| **Suggest a Resource** (`suggest_resource_click`)             | User clicks the "Suggest a Resource" link in the search autocomplete.                    |
| **Submit Resource Suggestion** (`suggest_resource_submit`)    | User successfully submits a "Suggest a Resource" form.                                   |
| **Apply Filter** (`filter_select`)                            | User selects a specific service type to narrow their results.                            |
| **Remove Filter** (`service_filter_unselect`)                 | User unchecks a service filter they previously selected.                                 |
| **Toggle Filter Category** (`service_filter_category_toggle`) | User clicks to expand or hide a whole group of filters.                                  |
| **Clear All Filters** (`service_filter_deselect_all`)         | User clicks the button to reset all active search filters.                               |
| **Profile/Modal View** (`profile_view`)                       | User opens an organization page, clicks a result card, or opens a service preview modal. |
| **Save/Unsave Item** (`item_save`)                            | User adds or removes a resource from their saved lists.                                  |
| **Outbound Click** (`outbound_click`)                         | User clicks an external link (website, email, phone, or directions).                     |
| **Consent Update** (`consent_update`)                         | User interacts with the cookie banner to grant or deny tracking permissions.             |
| **Quick Exit** (`safety_exit`)                                | User clicks the "Safety Exit" button to immediately leave the site.                      |
| **Donate** (`select_content`)                                 | User clicks the "Donate" button to support InReach.                                      |
| **Account Sign Up** (`sign_up`)                               | User successfully creates a new InReach account.                                         |
| **Account Log In** (`login`)                                  | User successfully signs into their existing account.                                     |
| **Open Report Form** (`report_open`)                          | User clicks to report an issue or correction.                                            |
| **Submit Report** (`report_submit_success`)                   | Fired after a user successfully sends a data correction report.                          |
| **View Service Details** (`select_content`)                   | Legacy event fired alongside `profile_view` when a service modal is opened.              |

### System Interactions (Automatic Events)

| System Event                                 | What triggers this?                                                                     |
| :------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **Start Visit** (`session_start`)            | Recorded automatically as soon as a person opens the InReach app in their browser.      |
| **Page View** (`page_view`)                  | Recorded whenever a user navigates between different pages on the site.                 |
| **Performance Metrics** (e.g., `LCP`, `CLS`) | Technical events that measure how quickly and smoothly the app is running for the user. |

---

## GA4 Dashboard Setup & Usage Guide

Since Google Analytics 4 is a "privacy-first" tool, it collects data but hides specific details (like which link was clicked or what filter was picked) until you manually register "Custom Dimensions." **If you don't do this, your reports will look empty.**

### 1. Registering Custom Dimensions (Required)

1.  Log in to your **Google Analytics** account.
2.  Click the **Admin** (gear icon) at the bottom left.
3.  Under **Data display**, select **Custom definitions**.
4.  Click **Create custom dimension** and add these items one by one. Use the exact "Event Parameter" names listed below.

| Dimension Name       | Scope | Event Parameter       | What it tells us                                                        |
| :------------------- | :---- | :-------------------- | :---------------------------------------------------------------------- |
| **Search Term**      | Event | `search_term`         | The specific text or location a user searched for.                      |
| **Search Context**   | Event | `search_term_context` | A snapshot of the search filters active when a result was clicked.      |
| **Item Name**        | Event | `item_name`           | The name of the organization or service being viewed.                   |
| **Search Location**  | Event | `search_location`     | The ZIP code or city name being searched (demand tracking).             |
| **Item ID**          | Event | `item_id`             | The internal database ID of the organization or service.                |
| **Link Type**        | Event | `link_type`           | The type of outbound click (website, email, phone, directions, social). |
| **Link URL**         | Event | `link_url`            | The destination URL or email address of an outbound click.              |
| **Result Position**  | Event | `position`            | The rank (1, 2, 3...) of a search result when it was selected.          |
| **Service Name**     | Event | `service_name`        | The specific filter name applied (e.g., "Shelter").                     |
| **Service Category** | Event | `service_category`    | The broad category of a filter (e.g., "Housing").                       |
| **Action**           | Event | `action`              | The specific sub-action taken (e.g., 'save' vs 'unsave').               |
| **Consent Status**   | Event | `status`              | Whether consent was 'granted' or 'denied'.                              |
| **Consent Service**  | Event | `service`             | The specific service for which consent was updated (e.g., 'ga4').       |
| **Report Target**    | Event | `report_target`       | Whether a report is for a 'service' or 'organization'.                  |
| **Issue Type**       | Event | `issue_type`          | The category of issue reported by a user.                               |
| **Search Version**   | Event | `search_version`      | Tracks if the query used the V2 Relevance engine or V1 Standard.        |
| **Sort Bias**        | Event | `sort_bias`           | Whether the user prioritized 'DISTANCE' or 'RELEVANCE'.                 |
| **Search Focuses**   | Event | `search_focuses`      | The ordered list of Community Focus IDs used for bubbling.              |
| **Relevance Score**  | Event | `relevance_score`     | The numeric score assigned to a result by the V2 engine.                |
| **Proximity Tier**   | Event | `proximity_tier`      | The distance tier (NEIGHBORHOOD, REGION, etc.) of the result.           |

### 2. How to See All Tracked Events

To see a quick overview of how often every action (like a search or a filter click) happens:

1.  Go to **Reports** > **Engagement** > **Events**.
2.  This table lists every event name (e.g., `filter_select`, `outbound_click`).
3.  Click on any event name to see a deeper report, including the custom dimensions you registered in Step 1.

### 3. Real-Time Verification (DebugView)

If you want to test if tracking is working while you use the app:

1.  Go to **Admin** > **Data display** > **DebugView**.
2.  Open InReach in your browser and perform some actions (like searching or clicking a website link).
3.  You will see events appear in the timeline. Click an event to see all the metadata (parameters) we are sending with it.

### 4. Building the Search Funnel (Explorations)

Standard reports don't show the "path" a user takes. To see the funnel (`Start` -> `Filter` -> `View` -> `Click`), you must create an **Exploration**:

1.  Click **Explore** (compass icon) in the left menu.
2.  Start a new **Blank** exploration.
3.  In the "Technique" dropdown, select **Funnel exploration**.
4.  In the **Steps** section (click the pencil icon), add these steps in order:
    - **Step 1: Start Session** (Event: `session_start`)
    - **Step 2: Applied Filter** (Event: `filter_select`)
    - **Step 3: Viewed Profile** (Event: `profile_view`)
    - **Step 4: Clicked Outbound** (Event: `outbound_click`)
5.  Click **Apply**. This creates a chart showing where users are dropping off in the journey from search to contacting a provider.

### 5. Identifying Top Search Locations (Demand Analysis)

To understand which geographical areas users are most frequently searching for services, follow these steps to create a custom report:

1.  Click **Explore** (compass icon) in the left menu.
2.  Start a new **Blank** exploration.
3.  In the **Variables** column (left side):
    - Under **Dimensions**, click `+` and import: `Event name` and `Search Location`.
    - Under **Metrics**, click `+` and import: `Event count`.
4.  In the **Tab settings** column (right side):
    - Drag `Search Location` from Dimensions to the **Rows** section.
    - Drag `Event count` from Metrics to the **Values** section.
    - Under **Filters**, add a filter for **Event name** exactly matches `search_executed`.
5.  This will display a table showing each unique `search_location` (ZIP code or city) and the total number of times a search was executed for that location.

### 6. Verifying Implementation (Technical Verification)

To confirm that ZIP codes and search terms are being sent to Google Analytics correctly:

1. Open the InReach app and open **Developer Tools** (F12).
2. Go to the **Network** tab and filter by `collect?v=2`.
3. Perform a search (e.g., enter a ZIP code).
4. Look for a request in the list, click it, and go to the **Payload** tab.
5. Verify the following parameters:
   - `en` (Event Name): `search_executed` (or `search_zero_results`).
   - `ep.search_location`: Should match the ZIP code or city entered.
   - `ep.search_term`: Should match the query text.
   - `ep.service_category`: Should show the active category ID.

---

## Feature Guide: Analyzing Your Data

### Search Effectiveness

- **Identify Coverage Gaps**: Look at the `search_zero_results` event. If you see a high volume of `search_term` values (like "Housing" in a specific city) returning zero results, it's a signal that we need to add more providers in that area.
- **Relevance Tracking**: Look at `position` for `profile_view`. If users are consistently clicking results at position 10 or higher, it means our search ranking algorithm isn't putting the most relevant things at the top.
- **V2 Engine Evaluation**: Compare `relevance_score` across `profile_view` events. Higher scores for clicked items confirm the "bubbling" logic is working; low scores on clicks suggest the weights need adjustment.

### Conversion & Engagement

- **Preferred Contact Methods**: Use the `link_type` dimension for `outbound_click`. Do users prefer to click the website link, or do they prefer to email directly?
- **Proximity Influence**: Use `proximity_tier` on `profile_view` to see if users are willing to travel to the `REGION` tier for certain services (like legal) but stay in `NEIGHBORHOOD` for others (like food).
- **Submission Rates**: Compare `report_submit_success` vs `report_open`. If 100 people open the form but only 5 submit it, the form might be too confusing or asking for too much info.

### Monitoring Consent Rates Over Time

To see how many users are opting into tracking vs. declining, create a "Free-form Exploration":

1.  Go to **Explore** > **Blank**.
2.  In the **Dimensions** list, click `+` and import: `Date` and `Consent Status`.
3.  In the **Metrics** list, click `+` and import: `Event count`.
4.  Set **Rows** to: `Date`.
5.  Set **Columns** to: `Consent Status`.
6.  Set **Values** to: `Event count`.
7.  Under **Filters**, add a filter for **Event name** exactly matches `consent_update`.
8.  Change the visualization at the top to a **Line chart** or **Stacked bar chart**.

This report will show you the daily trend of users who granted consent versus those who denied it.

---

**Important Note**: Once you add these dimensions, Google Analytics takes **24 to 48 hours** to process the data before it starts appearing in your reports.
