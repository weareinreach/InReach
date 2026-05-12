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

| Click Event                                                   | What triggers this?                                                                         |
| :------------------------------------------------------------ | :------------------------------------------------------------------------------------------ |
| **Search by Location** (`search`)                             | Fired when a user enters a city or ZIP code to find nearby resources.                       |
| **Search for Organization** (`orgSearch`)                     | Fired when a user types an organization's name directly into the search bar.                |
| **Select Service Filter** (`service_filter_select`)           | Fired when a user selects a specific service type (like "Shelter") to narrow their results. |
| **Remove Service Filter** (`service_filter_unselect`)         | Fired when a user unchecks a service filter they previously selected.                       |
| **Toggle Filter Category** (`service_filter_category_toggle`) | Fired when a user clicks to expand or hide a whole group of filters (like "Medical").       |
| **Clear All Filters** (`service_filter_deselect_all`)         | Fired when a user clicks the button to reset all active search filters at once.             |
| **View Service Details** (`select_content`)                   | Fired when a user clicks on a program in the search results to see its full information.    |
| **Quick Exit** (`safety_exit`)                                | Fired when a user clicks the "Safety Exit" button to immediately leave the site.            |
| **Donate** (`select_content`)                                 | Fired when a user clicks the "Donate" button to support InReach.                            |
| **Account Sign Up** (`sign_up`)                               | Fired when a user successfully creates a new InReach account.                               |
| **Account Log In** (`login`)                                  | Fired when a user successfully signs into their existing account.                           |
| **Open Report Form** (`report_open`)                          | Fired when a user clicks to report an issue or correction for a service or organization.    |
| **Submit Report** (`report_submit_success`)                   | Fired only after a user successfully sends their data correction report to our team.        |

### System Interactions (Automatic Events)

| System Event                                 | What triggers this?                                                                                |
| :------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **Start Visit** (`session_start`)            | Recorded automatically as soon as a person opens the InReach app in their browser.                 |
| **Page View** (`page_view`)                  | Recorded whenever a user navigates between different pages on the site.                            |
| **External Website Click** (`click`)         | Recorded when a user clicks a link that takes them to a provider's website or other external site. |
| **File Download** (`file_download`)          | Recorded when a user clicks a link to download a resource, such as a PDF.                          |
| **Performance Metrics** (e.g., `LCP`, `CLS`) | Technical events that measure how quickly and smoothly the app is running for the user.            |

---

## Feature Guide: "Report an Issue"

This section explains how we track user interactions specifically with the "Report an Issue" tool.

This guide explains how we track user interactions with the "Report an Issue" tool and how you can set up the Google Analytics 4 (GA4) dashboard to view these insights.

## Overview of Tracked Data

We track two main actions to help us understand how users are helping improve our data:

1.  **Opening the Form (`report_open`)**: This happens whenever a user clicks a button to report an issue for a service or organization.
2.  **Successful Submission (`report_submit_success`)**: This happens only after a user successfully sends their feedback to us.

## Step-by-Step GA4 Setup

While GA4 logs that these events happened automatically, it won't show you specific details (like _which_ issue was reported) until you register "Custom Dimensions."

### Steps to Register Dimensions:

1.  Log in to your **Google Analytics** account.
2.  Click the **Admin** (gear icon) at the bottom left.
3.  Under **Data display**, select **Custom definitions**.
4.  Click the blue **Create custom dimension** button and add these four items one by one:

| Dimension Name       | Scope | Event Parameter | What it tells us                                                       |
| :------------------- | :---- | :-------------- | :--------------------------------------------------------------------- |
| **Report Target**    | Event | `report_target` | Is this about a specific 'service' or the whole 'organization'?        |
| **Issue Type**       | Event | `issue_type`    | Which category did they pick? (e.g., Incorrect Info, Closed/Inactive). |
| **Report Language**  | Event | `language`      | Used if they reported a translation error.                             |
| **Reported Item ID** | Event | `item_id`       | The database ID of what they are reporting.                            |

---

## How to Find Your Answers

### 1. How many people are clicking the "Report" button?

In your standard reports, look for the **Event count** of `report_open`. This represents every time someone opened the reporting tool with the intention of giving feedback.

### 2. What is our "Submission Rate"?

This helps us see if the form is too hard to fill out.

- **How to calculate**: Compare the number of `report_submit_success` events to `report_open` events.
- **Insight**: If 100 people open it but only 5 submit it (a 5% rate), we may need to simplify the form.

### 3. Which issues are reported most often?

Use the **Explore** tab in GA4 to create a custom table:

- **Rows**: `Issue Type`
- **Values**: `Event count`
- **Insight**: This shows you if most problems are related to "Incorrect Information" versus services that are "Closed or Inactive."

### 4. Are people reporting Services or Organizations?

You can filter any report using the `Report Target` dimension.

- **Insight**: This helps us decide if we need to focus on cleaning up high-level agency data or the specific services they provide.

---

**Important Note**: Once you add these dimensions, Google Analytics takes **24 to 48 hours** to process the data before it starts appearing in your reports.
