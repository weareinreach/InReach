# How-To: Tracking the "Report an Issue" Feature in GA4

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
