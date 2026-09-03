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
- **Nothing currently prevents the app from being iframed on another domain.** No
  `X-Frame-Options` or CSP `frame-ancestors` is set anywhere — checked
  `next.config.mjs`, `vercel.json`, and app middleware. In practice this means any site
  could already embed `inreach.org` in a raw iframe today, unofficially, unattributed,
  and with no InReach involvement. Separately from the widget decision, this is worth
  flagging as a clickjacking-hardening gap — most apps with any session/account state
  deliberately restrict framing.

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

### Recommended model: API-key-gated self-serve embed

lgbtnearme.org's actual widget (the model we're targeting) is **not** a fully open,
no-signup iframe — it requires requesting an API key first:

> Request your API key → copy the embed code → paste into your website → once
> approved, visitors can find local resources through your website.

Their published features: search by ZIP/postal code and radius, category filtering,
free to use, a "youth-safe mode," and directory data "reliably and constantly updated"
by staff.

For InReach, the recommended shape combines options 1 and 3: a partner requests a key
via a short form, gets approved, and pastes an iframe/embed snippet containing that
key. The underlying search data is already public regardless of the key (see Technical
Review above) — the key isn't there to lock down data, it's there to gate the
_embedding relationship_. That distinction matters for scoping: a key doesn't need to
be treated as a secret (it will be visible in the partner's public page source), but it
does need per-key rate limiting and ideally a domain/referrer binding.

**Why gate with an API key at all, beyond security?**

- **Impact measurement for funder/board reporting** — concrete numbers ("searched X
  times across Y partner sites") instead of a vague "we have a widget."
- **Signal on who's actually live vs. who just requested a key** — tells InReach where
  to follow up.
- **A real partnership touchpoint** — the request itself is a lead into deeper
  alignment, not just a download.
- **Per-partner customization** (e.g., a youth-safe mode, a geo-scoped result set) tied
  to a known, approved requester, without exposing every option to anonymous embedders.
- **Usage as a product signal** — what's searched via partner sites vs. direct traffic
  can reveal different audience needs.
- **A contact list for change management** — if the widget's data model or behavior
  changes, InReach knows who to notify instead of breaking unknown sites silently.
- **Evidence for whether to grow the program** — adoption/growth trends are the basis
  for deciding whether to invest further, independent of any anonymous-iframe traffic
  InReach couldn't otherwise measure at all.

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

### Technical elements checklist

Concrete engineering-level items implied by the plan above, roughly in dependency
order:

1. **A slimmed-down widget page/UI** — defeatured relative to the main app, linking
   out to `app.inreach.org` for full detail. Must render sanely at arbitrary,
   partner-controlled iframe widths since InReach won't control the host page layout.
2. **Server-side enforcement of visibility/suppression logic — the prerequisite item.**
   Some of this (e.g., location visibility) currently appears to be enforced partly
   client-side, meaning the raw field may already reach the browser and only the UI
   chooses not to render it. That's tolerable for the main app; for a widget it means
   anyone reading the network response (not just the rendered page) could see
   suppressed data regardless of key-gating. This needs to become fully
   server-enforced — the response payload itself must never contain a suppressed
   field — before any widget-facing endpoint ships. Treat as a blocking prerequisite,
   not a parallel workstream.
3. **A dedicated, minimal widget response contract**, not a patched version of the
   existing internal search endpoint. A new, narrow schema that only ever returns the
   handful of fields the widget needs is far easier to guarantee correct than
   retrofitting suppression rules onto a general-purpose endpoint that has already
   regressed once (see Technical Review above).
4. **API key lifecycle** — request, approval, generation, storage, revocation — plus a
   validation mechanism (where the key gets checked, and ideally a domain/referrer
   binding so a key can't simply be copied onto an unapproved site).
5. **Rate limiting / abuse-protection infrastructure**, distinct from key _management_.
   Issuing keys doesn't throttle anything by itself; there needs to be actual per-key
   (and likely per-IP) request throttling in front of the widget endpoint.
6. **KPI definition and a dashboard** for tracking usage — by partner/org and,
   eventually, by contribution quality (see Phase 2 below).
7. **Restrict site-wide iframing, with a carved-out widget route.** Apply a CSP
   `frame-ancestors` (or `X-Frame-Options`) policy site-wide, with an explicit
   exception permitting framing only on the dedicated widget route. Note the actual
   access control still comes from the API key check, not from the frame-ancestors
   header itself — the header just says "this specific route may be framed," it
   doesn't know which partner is doing the framing.
8. **Versioned, cache-safe rollout for the widget page.** Since it's live on external
   sites, a bad deploy or breaking change ships to every embedded partner
   simultaneously — worth a deliberate versioning/rollout approach rather than
   discovering the need after an incident.
9. **Likely no CORS work needed**, as a side effect of the recommended architecture:
   because the widget is a server-rendered iframe (not a client-side JS SDK calling the
   API cross-origin), the API call happens same-origin, inside the page InReach itself
   serves. This is a point in favor of the iframe approach over a JS-snippet model.

### API-wide hardening scope (found during this review)

Checked how much of the existing API is already unauthenticated, to understand whether
"add rate limiting" is widget-specific or a bigger existing gap:

- **~84 `publicProcedure` (unauthenticated) handlers already exist**, out of roughly
  ~220 total tRPC procedures — not just org search. They span org/location/service
  data, reviews, geo lookups, feature flags, and, notably, **unauthenticated auth
  flows**: signup, forgot-password, confirm-account, reset-password, resend-code. None
  of this has rate limiting today. This gap predates the widget entirely — it's
  something this review surfaced, not something the widget creates.
- **Good news: there's already one shared middleware insertion point.** Every
  procedure type (`publicProcedure`, `protectedProcedure`, `permissionedProcedure`,
  `staffProcedure`, `adminProcedure`) derives from a single `baseProcedure`
  (`packages/api/lib/trpc.ts`), which already applies a Sentry middleware globally this
  same way. Adding rate limiting there is one change applied broadly — not a
  route-by-route retrofit across 84+ handlers.
- **Two decisions remain, independent of the insertion mechanism:**
  - _Scope_ — harden just the ~84 already-public procedures first (where anonymous
    abuse is actually possible today), or all ~220 (defense-in-depth against
    compromised authenticated accounts too)?
  - _Limits will vary by route even with one shared mechanism_ —
    `forgot-password`/`resend-code` need much tighter per-IP/per-account throttling
    than a search query does. One insertion point, but per-route/per-category
    configuration.
- **Recommendation:** treat broader API-wide rate limiting as a related but separate
  hardening initiative that this widget review surfaced — worth prioritizing on its
  own, but it shouldn't block or inflate the widget project's scope. At minimum, the
  widget's own new endpoint(s) need rate limiting as part of this project regardless of
  what happens with the other 83.

## Risk Assessment

| Risk                                          | Level           | Why                                                                                                                                                                                                                                                                      |
| --------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Privacy/safety (outing & physical safety)** | **High**        | The dataset includes orgs that must not have physical locations exposed. the widget search needs to respect this. Currently the hiding of data is done partly on the server and partly on the client (browser/mobile view). This will need to be researched and refined. |
| **Security (no rate limiting/auth today)**    | **High**        | Publicizing an endpoint with zero throttling or key management invites scraping and abuse from day one. Must be solved independent of, and before, the widget itself.                                                                                                    |
| **Loss of content control / brand risk**      | **Medium-High** | Once embedded, InReach doesn't control what surrounds the widget on a partner's page. A misleading or hostile org embedding it could imply false affiliation or vetting by InReach.                                                                                      |
| **Data staleness / liability**                | **Medium**      | Cached or outdated widget versions on partner sites could display stale safety-critical info (e.g., an org that closed or relocated), reflecting on InReach's credibility.                                                                                               |
| **Legal/compliance**                          | **Medium**      | No existing partner-agreement framework; accessibility (WCAG/ADA) exposure once the widget runs inside arbitrary third-party pages InReach can't fully test.                                                                                                             |
| **Operational overhead**                      | **Low-Medium**  | Cross-browser/partner support burden; multiple widget versions live in the wild simultaneously; partner onboarding/support load.                                                                                                                                         |

## Phase 2/3 — Partner Contributions ("Suggest an Org")

Once an approved partner base exists, the same trust relationship established by API
key approval could be extended into a second, later capability: letting partners and
community organizers _suggest_ new orgs/services, not just search existing ones. This
is a write path and a materially different risk category from the read-only widget
above — it should ship after the core widget program is established, not bundled into
the initial build.

- **Staff still vets and publishes — no auto-publish.** Suggestions land in a review
  queue; approved-partner status shortens the data-entry burden, not the verification
  burden. Confirming an org is real, meets InReach's inclusion/safety criteria, and
  isn't a duplicate remains a staff judgment call regardless of submission quality.
- **A richer, wizard-style submission form for approved partners** — similar in spirit
  to InReach's internal Data Entry wizard, but adapted for external submitters who
  won't already know InReach's taxonomy (services/attributes/focuses, address
  visibility, etc.). This shifts bulk data entry onto trusted contributors and leaves
  staff to review/verify rather than transcribe.
- **"Approved to embed" and "trusted to suggest orgs" are not automatically the same
  bar.** Being vetted to display InReach's data is a different judgment than being
  vetted to vouch for a new org's legitimacy. Worth deciding explicitly whether the
  same API-key approval unlocks this, or whether it's a distinct, slightly higher tier.
- **Citations, modeled on wiki-style verifiability — but internal, not public.**
  Requiring a source for a submitted fact (the org's own site, a news article, direct
  confirmation) gives staff something concrete to verify against. Unlike a public wiki,
  the citation _content_ should stay internal/staff-only rather than public — a
  citation could reveal how someone knows a sensitive fact (e.g., a named contact at a
  specific location), which is its own outing/safety exposure. This borrows wiki's
  citation discipline, not its open-edit-then-revert publishing model.
- **Public attribution of the contributing partner is a separate, lower-risk, and
  genuinely valuable feature.** Crediting "Suggested by [Partner]" on a published
  listing is good PR and a real incentive for continued participation — distinct from,
  and safe to do independently of, keeping citation sourcing internal.
- **Per-partner submission quality becomes a strong KPI** — approval rate, time to
  publish, duplicate rate — feeding the same partner-level dashboard as widget usage,
  and a legitimate signal for adjusting or revoking a partner's wizard access.
- **Submitters need visibility into status** (submitted → in review →
  published/declined) to stay engaged, and duplicate detection is needed once multiple
  partners can suggest overlapping orgs independently.
- **Marketing/PR value** — a "built with our community" narrative (e.g., "X% of new
  listings this year came through partner contributions") is a compelling data point
  for grant reporting, board updates, and general brand positioning, beyond the direct
  data-growth benefit.

## Open Questions

- Which orgs, if any, should be excluded from widget-eligible results by default (vs.
  requiring explicit opt-in)?
- Who owns partner vetting/onboarding — Product, Partnerships, or Eng?
- What's the criteria/process for revoking a partner's widget access?
- Does this require legal review for a partner-facing terms of use before any pilot?
- Should the app restrict iframing sitewide (`X-Frame-Options`/CSP `frame-ancestors`)
  and carve out only the dedicated widget route, given nothing prevents framing today?
- Is API-key approval for embedding sufficient trust to also unlock the "suggest an
  org" wizard, or should that be a separate, higher tier granted after a track record?
- Who reviews partner-submitted org suggestions, and does that queue merge with
  InReach's existing org-onboarding/curation workflow or run separately?
