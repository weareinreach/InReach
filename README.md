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

**InReach** is the world’s first tech platform matching LGBTQ+ people with safe, verified resources.

InReach is for the entire diverse LGBTQ+ community – including asylum seekers and refugees, undocumented and other immigrants, young people experiencing homelessness, those facing family or community rejection due to their identity, and other transgender and non-binary people in need of safe resources.

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

This project uses [`pnpm`](https://pnpm.io/) to manage packages. To install, run the command:

```bash
npm -g install pnpm
```

or follow the instructions on [pnpm's installation page](https://pnpm.io/installation).

### Installation

To install the required packages & dependencies:

```bash
pnpm install
```

## Project Structure

```text
InReach/
├── apps/
│   ├── app/                      # InReach Application
│   └── web/                      # InReach Main Site
├── docker/				                # Docker compose file for local DB instance
├── packages/
│   ├── api/   			              # tRPC API route definitions
│   ├── auth/   			            # NextAuth settings
│   ├── aws-user-migrate/	        # AWS Lambda for user migration
│   ├── config/			              # Other shared configs
│   ├── db/   			              # Prisma DB schema & other db scripts
│   ├── eslint-config/		        # Custom ESlint configuration
│   ├── i18next-crowdin-backend/  # Crowdin plugin for translation delivery
│   ├── types/  		              # Shared TypeScript types
│   └── ui/                       # React components shared between apps
└── patches/			                # Patched npm packages
```

## Usage

To start the development live servers:

```bash
pnpm dev:app	# Starts Next.js for the InReach WebApp
pnpm dev:web	# Starts Next.js for inreach.org (future project)
pnpm dev:ui	  # Starts Storybook for UI component development
```

Next.js based projects will be available at `http://localhost:3000`

Storybook will be available at `http://localhost:6006`

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

[![Structured Content Powered by Sanity](.github/images/sanity-logo.svg)](https://sanity.io)
