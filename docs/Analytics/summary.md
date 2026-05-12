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

Beyond the "Report an Issue" feature, the following areas are tracked automatically:

- **Search & Discovery**: We track what terms people search for, the locations they enter, and whether they are searching for specific organizations.
- **Service Filtering**: We monitor which categories (e.g., "Legal," "Healthcare") and specific service filters are being used to narrow down results.
- **Content Engagement**: We track when users open service details (modals) and when they click the "Donate" button.
- **User Actions**: We log when users successfully log in or create a new account.
- **Safety & Performance**:
  - **Safety Exit**: We track usage of the "Safety Exit" button to understand the safety needs of our users.
  - **Web Vitals**: We automatically track technical performance (loading speeds, stability) to ensure a smooth experience across all devices.

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
