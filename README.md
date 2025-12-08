<h1 align="center">
  <a href="https://github.com/weareinreach/inreach">
    <picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/images/InReach_Logo_White_RGB-1024x384.webp">
  <img alt="InReach Logo" src=".github/images/InReach_Logo_Color_RGB-1024x384.webp" height=100>
</picture>
  </a>
</h1>

<div align="center">
  <br />
  <a href="#about"><strong>Explore the screenshots »</strong></a>
  <br />
  <br />
  <a href="https://github.com/weareinreach/inreach/issues/new?assignees=&labels=bug&template=01_BUG_REPORT.md&title=bug%3A+">Report a Bug</a>
  ·
  <a href="https://github.com/weareinreach/inreach/issues/new?assignees=&labels=enhancement&template=02_FEATURE_REQUEST.md&title=feat%3A+">Request a Feature</a>
  .
  <a href="https://github.com/weareinreach/inreach/issues/new?assignees=&labels=question&template=04_SUPPORT_QUESTION.md&title=support%3A+">Ask a Question</a>
</div>

<div align="center">
<br />

[![Project license](https://img.shields.io/badge/license-GPLv3-red?style=flat-square)](LICENSE)

[![Pull Requests welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg?style=flat-square)](https://github.com/weareinreach/inreach/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
[![code with love by InReach](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-InReach%20%26%20Friends-ff1414.svg?style=flat-square)](https://github.com/weareinreach)

</div>

<details open="open">
<summary>Table of Contents</summary>

- [About](#about)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Integrations](#integrations)
- [Roadmap](#roadmap)
- [Support](#support)
- [Project assistance](#project-assistance)
- [Contributing](#contributing)
- [Authors & contributors](#authors--contributors)
- [Security](#security)
- [License](#license)
- [Acknowledgements](#acknowledgements)

</details>

---

## About

**InReach** is the world’s first tech platform matching LGBTQ+ people facing persecution and discrimination with safe, verified resources.

The InReach App is available on web (desktop and mobile), and native iOS and Android. Over 9,000 services across the U.S. are currently listed, with new verified services added every day by trained volunteers. InReach’s open-source technology instantly matches LGBTQ+ people in need with independently verified safe housing, medical and mental health care, immigration and other legal help, meal assistance, education and employment, translation, community and spiritual support, and more critical services. InReach is a comprehensive, digital one-stop-shop for all intersectional community needs, with listed verified services for LGBTQ+ asylum seekers, refugees and other immigrants, BIPOC communities, transgender folks, youth and caregivers, and more. The InReach App is free for everyone – including lawyers, case managers, social workers, and other service providers and community organizations searching for affirming resource referrals for LGBTQ+ clients.

<!-- <details>
<summary>Screenshots</summary>
<br>

> **[?]**
> Please provide your screenshots here.

|                               Home Page                               |                               Login Page                               |
| :-------------------------------------------------------------------: | :--------------------------------------------------------------------: |
| <img src=".github/images/screenshot.png" title="Home Page" width="100%"> | <img src=".github/images/screenshot.png" title="Login Page" width="100%"> |

</details> -->

### Built With

- [Next.js](https://nextjs.org/)
- [Mantine](https://mantine.dev/)
- [Prisma](https://www.prisma.io/)
- [tRPC](https://trpc.io/)
- [Turborepo](https://turborepo.org/)
- [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

#### pnpm

This project uses [`pnpm`](https://pnpm.io/) to manage packages. To install, run the command:

```bash
npm -g install pnpm
```

or follow the instructions on [pnpm's installation page](https://pnpm.io/installation).

#### Docker

Docker (& docker compose) are used for local databases. Instructions to install Docker [can be found here](https://docs.docker.com/get-docker/)

### Installation

To install the required packages & dependencies:

```bash
pnpm install
```

## Project Structure

```bash
InReach/
├── @types/                       # Shared TypeScript types/overrides
├── apps/
│   ├── app/                      # InReach Application
│   └── web/                      # InReach Main Site
├── docker/                       # Docker compose file for local DB instance
├── lambdas/
│   ├── cognito-messaging/        # AWS Lambda to generate Cognito emails
│   └── cognito-user-migrate/     # AWS Lambda for user migration
├── packages/
│   ├── analytics/                # Analytic event handling
│   ├── api/                      # tRPC API route definitions
│   ├── auth/                     # NextAuth settings
│   ├── config/                   # Other shared configs
│   ├── crowdin/                  # Crowdin API/OTA
│   ├── db/                       # Prisma DB schema & other db scripts
│   ├── env/                      # Environment variable validation
│   ├── eslint-config/            # Custom ESlint configuration
│   ├── ui/                       # React components shared between apps
│   └── util/                     # Misc utility scripts/modules
└── patches/                      # Patched npm packages
```

## Usage

To start the development live servers:

```bash
pnpm dev:app  # Starts Next.js for the InReach WebApp
pnpm dev:web  # Starts Next.js for inreach.org (future project)
pnpm dev:ui   # Starts Storybook for UI component development
```

Next.js based projects will be available at `http://localhost:3000`

Storybook will be available at `http://localhost:6006`

## Integrations
### Crowdin
InReach integrates with **Crowdin** to manage multilingual translations for both **common UI content** and **dynamic org-data**.

- **Common translations** (`common`, `landingPage`, `services`) are static JSON files. Updates are made via PR merges after Crowdin export.
- **Org-data translations** (`orgn_*` namespaces) are dynamic and always live. They are fetched via the **OTA (Over-The-Air) system**, ensuring the latest translations are immediately available in the app.

**OTA Flow:**
1. Crowdin exports translations for both common and database-backed namespaces.
2. OTA generates a manifest file (`manifest.json`) that tracks the latest version of each namespace.
3. The app calls the **Edge API** endpoint `/api/i18n/load` with the requested language (`lng`) and namespaces (`ns`).
4. The loader fetches translations from:
   - Redis cache (fastest)
   - File-based JSON for common namespaces
   - DB-backed keys for org-data namespaces
5. Updated translations are stored in Redis for subsequent requests.
6. Org-data translations appear live in the app immediately, without requiring a PR merge.

- Org-data translations (orgn_*) are live via OTA.
- Common translations require a PR merge to update dev/main.

## Crowdin Integration - Code Overview

The Crowdin integration in InReach involves a set of packages and files that handle fetching translations from Crowdin, caching them, and serving them to the app. Below is a structured list of the key code files controlling this integration.

---

### 1. Crowdin Client Package (`@weareinreach/crowdin`)

| File | Purpose |
|------|---------|
| `ota/index.ts` | Fetches OTA manifests from Crowdin and downloads translation files or keys. |
| `ota/edge.ts` | Provides edge-compatible functions for OTA, suitable for Next.js Edge runtime. |
| `cache/index.ts` | Handles Redis caching of translations to reduce repeated network calls. |
| `api/index.ts` | REST API wrapper for Crowdin interactions (if needed). |

---

### 2. App Layer (`@weareinreach/app`)

| File | Purpose |
|------|---------|
| `src/pages/api/i18n/load.ts` | Next.js API Edge route that serves translation data to the app. It reads from Redis cache and falls back to OTA for missing keys. |

---

### 3. DB / Static Migration Layer (`@weareinreach/db`)

| File | Purpose |
|------|---------|
| `prisma/data-migrations/*` | Static migration jobs that run once to update translation keys or other data in the database. |
| `prisma/dataMigrationRunner.ts` | Runner that executes all pending migration jobs against the Prisma database. |

---

### Summary of Flow

1. **Crowdin** produces translation files and an OTA manifest.  
2. **Crowdin Client (`ota`)** downloads translations and keys, using Redis cache to minimize network calls.  
3. **App (`i18n/load.ts`)** fetches translations for requested languages and namespaces, reading from cache or OTA as needed.  
4. **Database (`data-migrations`)** is updated only for static migration jobs via `dataMigrationRunner.ts`. OTA updates for org-data happen dynamically at runtime; static translations are applied once via migrations.

### Crowdin Costs:
**Crowdin Usage Overview (from Billing info)**
- Managers: InReach has 10 users with the ability to manage translations. The plan allows up to 1,000,000 managers, before hitting a limit. 
- Words: Inreach has used 28,188,094 words of a 100,000,000-word allowance. Crowdin tracks all words in the project, including source strings and translations.

**Implications:**
- InReach is using the open-source plan, which has very high limits for managers and words.
- Crowdin doesn’t charge based on how the app fetches translations (OTA or PRs). They charge based on words in the translation project and the number of managers.

## Roadmap

See the [open issues](https://github.com/weareinreach/inreach/issues) for a list of proposed features (and known issues).

- [Top Feature Requests](https://github.com/weareinreach/inreach/issues?q=label%3Aenhancement+is%3Aopen+sort%3Areactions-%2B1-desc) (Add your votes using the 👍 reaction)
- [Top Bugs](https://github.com/weareinreach/inreach/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Areactions-%2B1-desc) (Add your votes using the 👍 reaction)
- [Newest Bugs](https://github.com/weareinreach/inreach/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

## Support

Reach out to the maintainer at one of the following places:

- [GitHub issues](https://github.com/weareinreach/inreach/issues/new?assignees=&labels=question&template=04_SUPPORT_QUESTION.md&title=support%3A+)
- Contact options listed on [this GitHub profile](https://github.com/weareinreach)

## Project assistance

If you want to say **thank you** or/and support active development of InReach:

- Add a [GitHub Star](https://github.com/weareinreach/inreach) to the project.
- Tweet about InReach.
- Write interesting articles about the project on [Dev.to](https://dev.to/), [Medium](https://medium.com/) or your personal blog.

Together, we can make InReach **better**!

## Contributing

First off, thanks for taking the time to contribute! Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make will benefit everybody else and are **greatly appreciated**.

Please read [our contribution guidelines](https://github.com/weareinreach/.github/blob/main/CONTRIBUTING.md), and thank you for being involved!

## Authors & contributors

The original setup of this repository is by [InReach](https://github.com/weareinreach).

For a full list of all authors and contributors, see [the contributors page](https://github.com/weareinreach/inreach/contributors).

## Security

InReach follows good practices of security, but 100% security cannot be assured.
InReach is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/weareinreach/.github/blob/main/SECURITY.md)._

## License

This project is licensed under the **GNU General Public License v3**.

See [LICENSE](LICENSE) for more information.

## Acknowledgements

[![Powered by Vercel](.github/images/powered-by-vercel.svg)](https://vercel.com/?utm_source=in-reach&utm_campaign=oss)

[![built with Codeium](https://codeium.com/badges/main)](https://codeium.com)
