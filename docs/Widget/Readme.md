# InReach Embeddable Widget

## Product Ask

Product management wants to explore building a widget that InReach can share with
aligned/partner organizations to embed on their own websites — similar to
[lgbtnearme.org/widget](https://www.lgbtnearme.org/widget). The widget would let a
visitor on a partner's site search for nearby LGBTQ+-affirming orgs/resources without
leaving that site, using InReach's underlying directory data.

Goal: extend InReach's reach and value to partner orgs' audiences, without requiring
those visitors to know about or navigate to InReach directly.

This document captures the first-level findings from a technical review of the current
codebase, followed by a proposed high-level plan and risk assessment. No implementation
has started — this is scoping only.

## Technical Review — Current State

- **Org search is already public and unauthenticated.** `searchDistanceAdv`
  (`packages/api/router/organization/index.ts`, `query.searchDistanceAdv.handler.ts` /
  `.schema.ts`) is a `publicProcedure` — no login required. It takes `lat`/`lon`,
  radius (`dist`), unit, pagination (`skip`/`take`), and filters (`services`,
  `attributes`, `focuses`), and returns tiered results (neighborhood → national) with a
  relevance score. This means the hard part — public geo search — already exists.
- **No public API infrastructure exists.** There are no API keys, no partner/origin
  allowlisting, no CORS configuration for third-party domains, and no existing
  embed/iframe/widget code anywhere in the repo
- **No rate limiting or abuse protection exists anywhere in the API layer.** The search
  endpoint is open today only because it's convenient — it's assumed to be called by
  InReach's own frontend, not by arbitrary third parties. Would want to harded this.
- **Anonymous access is already supported at the app level.** `apps/app/src/middleware.ts`
  issues an anonymous session cookie for geo-redirect purposes; the search page itself
  requires no auth. There's no existing per-caller identity to hang authorization, rate
  limiting, or usage analytics on for a widget use case.

**Bottom line:** the underlying search capability is closer to embeddable than expected,
but none of the guardrails a public embed requires exist yet:

- No rate limiting or throttling on any API endpoint
- No API keys or partner identity/authentication mechanism
- No allowed-origin (CORS) restrictions for third-party domains
- No partner registry — no way to know who is embedding or where
- No per-partner kill switch or ability to revoke access
- No usage analytics or anomaly/abuse detection on search traffic
- No audited, dedicated "public-safe" response shape — the endpoint returns the same
  data model used internally
- No org-level consent flow for appearing in a third-party embed, distinct from
  standard directory-listing consent
- No partner terms of use / data-licensing agreement framework

## Proposed Plan (High Level)

### Build approach

Three architectural options exist, in increasing order of flexibility and exposure:

1. **Iframe embed (recommended starting point).** InReach hosts a sandboxed search
   page; partners embed it with a single `<iframe>` tag. Simplest to build, easiest to
   version and kill-switch, and keeps all suppression/visibility logic entirely
   server-side and out of partner-controlled code. Least customizable styling.
2. **JS snippet / embeddable SDK.** A `<script>` tag renders a styled widget natively
   into the partner's page, calling InReach's API client-side. More brandable and
   native-feeling, but the full response payload becomes visible in the partner site's
   network traffic/DOM, and the API must now be safely callable cross-origin from
   arbitrary domains.
3. **Public API + API key.** For technical partners who want fully custom UI. Most
   flexible, but also the most exposure — a key holder can extract the full underlying
   dataset rather than just a rendered result.

### What needs to be built

- **A dedicated, minimal embed API surface** — not the internal search endpoint reused
  directly. Only pre-sanitized, whitelisted fields should ever be returned; raw records
  should never reach client-side rendering.
- **Rate limiting and abuse protection** on any public-facing endpoint — must exist
  before anything is exposed externally, independent of the widget work itself.
- **Partner registry & authorization** — API keys or an allowed-origin list, so InReach
  knows who is embedding and can revoke access per partner.
- **Kill switch** — ability to disable a specific partner's widget, or the whole
  feature, instantly.
- **Org consent for widget inclusion** — orgs opted into InReach's own directory, not
  necessarily into appearing on third-party sites InReach doesn't vet. Needs its own
  opt-in, separate from standard listing consent.
- **Partner agreement / terms of use** — usage limits, no re-scraping/republishing the
  dataset, attribution requirements, accessibility obligations for how the embed is
  hosted on their page.
- **Versioned, CDN-hosted embed delivery** — so a security fix can be pushed globally
  without requiring every partner to re-integrate.
- **Per-partner usage analytics** — to detect abusive/anomalous traffic and to report
  value delivered back to aligned orgs.
- **A fresh audit of the visibility/suppression logic** specifically for the widget
  path, given it has already regressed once under lower exposure.

## Risk Assessment

| Risk                                          | Level           | Why                                                                                                                                                                                                                                                                      |
| --------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Privacy/safety (outing & physical safety)** | **High**        | The dataset includes orgs that must not have physical locations exposed. the widget search needs to respect this. Currently the hiding of data is done partly on the server and partly on the client (browser/mobile view). This will need to be researched and refined. |
| **Security (no rate limiting/auth today)**    | **High**        | Publicizing an endpoint with zero throttling or key management invites scraping and abuse from day one. Must be solved independent of, and before, the widget itself.                                                                                                    |
| **Loss of content control / brand risk**      | **Medium-High** | Once embedded, InReach doesn't control what surrounds the widget on a partner's page. A misleading or hostile org embedding it could imply false affiliation or vetting by InReach.                                                                                      |
| **Data staleness / liability**                | **Medium**      | Cached or outdated widget versions on partner sites could display stale safety-critical info (e.g., an org that closed or relocated), reflecting on InReach's credibility.                                                                                               |
| **Legal/compliance**                          | **Medium**      | No existing partner-agreement framework; accessibility (WCAG/ADA) exposure once the widget runs inside arbitrary third-party pages InReach can't fully test.                                                                                                             |
| **Operational overhead**                      | **Low-Medium**  | Cross-browser/partner support burden; multiple widget versions live in the wild simultaneously; partner onboarding/support load.                                                                                                                                         |

## Open Questions

- Which orgs, if any, should be excluded from widget-eligible results by default (vs.
  requiring explicit opt-in)?
- Who owns partner vetting/onboarding — Product, Partnerships, or Eng?
- What's the criteria/process for revoking a partner's widget access?
- Does this require legal review for a partner-facing terms of use before any pilot?
