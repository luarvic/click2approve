# Frontend development

The shared React frontend serves both editions. Feature availability comes from
backend capabilities; styling has the same owners in both editions.

## Toolchain

Use Node.js 24 LTS and install dependencies with `npm ci`. CI and the UI Docker
build use the same Node.js major version. The frontend uses React 19, MUI 9,
Vite 8, and ESLint 10.

TypeScript is held at 6.0.x because `@typescript-eslint` 8.70.1 requires
TypeScript below 6.1. Upgrade to TypeScript 7 when the lint tooling supports it;
do not bypass peer dependency checks with `--force` or `--legacy-peer-deps`.

## User documentation

The public UI image includes an English-only open-source portal: a landing page
at `/`, user guides at `/docs/`, and community help at `/contact/`. The shared
React app lives at `/app/`. Commercial guides and legal notices are not bundled.
The portal has no language picker or saved-language redirects. Missing pages
return HTTP 404.

From `ui/`, install dependencies and preview the portal:

```sh
npm ci
python3 -m venv .venv-docs
.venv-docs/bin/python -m pip install -r docs/requirements.txt
.venv-docs/bin/python -m mkdocs serve --dev-addr 127.0.0.1:8000
```

With Vite running, open `http://localhost:3333/` or `/docs/` to share appearance
preferences with the app. Vite proxies public pages to MkDocs on port 8000.
The public workspace's `run-docs` task starts this preview. The business workspace
selects its own portal configuration.

English content lives in `docs/content/`; navigation is in `mkdocs.yml`. Add
guides to both the Documentation menu and `docs/content/docs/index.md`. Previous,
Table of contents, and Next links follow the menu order automatically. Keep
instructions limited to the open-source edition and preserve literal app labels.
Developer setup and deployment instructions belong in repository documentation.

Both portals reuse the theme overrides in `docs/overrides/`, shared CSS and scripts
under `docs/content/`, locally served Sora fonts, branding, search, and appearance
controls. A portal can supply `docs/overrides/` beside its configuration to override
individual shared templates. Its own content, navigation, and search build remain
independent. Commercial content and localization are maintained in the business
repository.

Build and validate the shipped public image with:

```sh
.venv-docs/bin/python -m mkdocs build --strict
.venv-docs/bin/python docs/test_hooks.py
npm run test:nginx
npm run test:nginx -- --browser
```

The smoke test checks real HTTP routes, missing commercial and translated URLs,
search, sitemap, and local navigation links. Browser checks also verify that a
saved language from another portal does not redirect the English portal.

Set `DOCS_SITE_URL` to this installation's origin, including the trailing `/`.
The local default is `http://localhost:3333/`. `DOCS_API_BASE_URI` controls the
Swagger link; previews default to `http://localhost:5555`, and static builds use
the site's `/swagger/` unless configured otherwise. Both are Docker build arguments.

The portal omits Terms and Privacy links by default. To provide operator notices,
pass `SITE_TERMS_URL` and `SITE_PRIVACY_URL` to the documentation build (or as Docker
build arguments). Set matching `SiteLinks:TermsUrl` and `SiteLinks:PrivacyUrl` in
the API and event consumer for app and email footers. These links do not enable
signup agreement requirements. Use absolute HTTP(S) URLs for external notices.

## Optional analytics

Google Analytics is disabled when `GOOGLE_ANALYTICS_ID` is unset or empty.
To offer opt-in analytics across the website, docs, and app, pass
`--build-arg GOOGLE_ANALYTICS_ID=G-YOURID` to the UI Docker build. Outside Docker,
set `GOOGLE_ANALYTICS_ID` for both Vite and MkDocs. Rebuild to change the ID.
The app uses a MUI consent banner; the English static portal uses the same
Allow analytics choice and close action. The commercial portal localizes its
static banner. The choice
is remembered for 180 days and synchronized across pages and tabs on the same origin.
Closing without enabling analytics remembers rejection. Footer Analytics settings
reopen the banner. Without an ID, no banner or settings control is shown.
App navigation sends fixed screen labels and route templates with identifiers removed.
Withdrawal stops tracking and clears Analytics cookies without reloading app forms.
In the GA4 property, keep Google Signals, advertising features, and Enhanced
Measurement disabled; only explicit sanitized page views are sent.

For the local consent preview, run Vite and MkDocs with the same ID and open
`http://localhost:3333/` (including docs and `/app/`). The static consent module uses Vite
in development and the built `/app/analytics-consent.js` in production. Using a
single origin shares consent and theme preferences; port 8000 alone does not serve
the consent module. Without an ID, the missing Analytics settings link is expected locally.

See [frontend build settings](../docs/configuration.md#frontend-build-settings).

The container smoke check verifies the selected mode:

```sh
npm run test:nginx
GOOGLE_ANALYTICS_ID=G-ANALYTICSTEST npm run test:nginx
# Docker and Playwright Chromium required; CHROME_BIN can select a local browser.
npm run test:browser:analytics
GOOGLE_ANALYTICS_ID=G-ANALYTICSTEST npm run test:browser:analytics
```

## Style and settings ownership

| Responsibility                                     | Location                                                | Examples                                                         |
| -------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| Environment configuration and application behavior | `src/shared/config/application.ts`                      | API URLs, timeouts, polling, debounce, notification durations    |
| Shared visual values                               | `src/shared/theme/tokens.ts`                            | Surface radius, named stack spacing                              |
| Global MUI appearance and defaults                 | `src/shared/theme/createAppTheme.ts`                    | Card borders and default shadows, input variants, typography     |
| Reusable component presentation                    | Beside the component in `src/shared/components/<area>/` | Shell layout, page styles, filter widths, notification placement |
| Feature-specific settings                          | `src/features/<feature>/`                               | Grid column sizes, approval-step layout, identity messages       |
| A single component's details                       | Named constants in that component                       | A local gap, illustration colors, one-off positioning            |

Import values directly from their owner. Do not add a catch-all constants module
or re-export configuration and routing from a style file. Keep application
configuration independent of MUI and CSS. Shared visual tokens contain values,
not `sx` objects, JSX, or application behavior. Use MUI's palette, spacing and
breakpoints before adding custom visual values. Numeric `sx` spacing values and
`StackSpacing` use MUI spacing units; the surface radius uses an explicit CSS length.

Shared styles used by several components in the same area can live in a focused
`*Styles.ts` module beside them. Keep feature layout within its feature, and use
component-specific names rather than generic names such as `constants.ts`.
For styles used in one component, keep the constant in that file unless the
size or complexity warrants a companion file.

The app theme follows the public landing page and Docs portal: Sora typography,
green accents, muted secondary text, light borders, and medium-weight headings.
Structural headings are uppercase with 1px letter spacing and muted color.
`CardHeading` uses the theme’s `cardTitle` variant (12px, weight 600) for whole-card
titles and its default `sectionLabel` variant (10px, weight 500) for sections.
Request/task/upcoming headers, form-card titles, and Usage card titles use
`cardTitle`; Details, Activity, Artifacts, nested form sections, workflow steps,
receipt sections, and discussion headings use `sectionLabel`. Select the visual
role independently of the semantic heading element. Breadcrumbs and menu groups
retain the theme’s `overline` typography (10px, weight 600).
Page and dialog titles, content, plan names, tabs, buttons, and field labels use
sentence case; preserve proper names and abbreviations.
`SitePaletteTokens` in `tokens.ts` mirrors the light and dark public-site colors
in `docs/content/stylesheets/app.css`. Keep those palettes aligned when changing
shared brand colors. Buttons and tabs use sentence case; menu groups use small,
semibold uppercase labels with extra space above them. Page gutters adapt to
mobile and desktop widths through `pageStyles.ts`.

Shared tabs use compact sentence-case labels and scroll controls on narrow screens.
Cards and tables use open spacing, muted labels, and light dividers. Receipt details
follow the same label/value layout; file hashes retain monospace text, and printing
uses dark ink on white regardless of the selected theme.

Workflow editors and read-only workflows share `ApprovalStepList`, `ApprovalStepSection`,
and `ApprovalStepHeader` in `features/approvalWorkflow/components`. These own the flat
step layout, spacing, status/edit icons, and header actions. Keep task and editor
cards flat and aligned with the request card; use step headings and spacing for grouping.

Request and task summaries use a single outer card with equal responsive padding
on all sides (20px on small screens and 28px on desktop). Their headers compact
control-generated vertical space without shrinking hit areas, and the final
summary row omits extra bottom padding. Interior rows and the 32px section gaps
retain their spacing. A 16px gap separates the summary header from its content,
without a divider; the status and chevron remain visible when collapsed.
Keep these adjustments in the shared summary layout;
form cards, chat headings, and printed receipts retain their own presentation.
Details, Artifacts, and Activity are always visible and stacked vertically,
with no inner panel borders; their fields use light divider rows like the landing-page example
cards. Keep this presentation in the approval request components so editor
cards and unrelated forms retain their own layout.
Request submission and task response forms share `FormCard` and `FormSection` from
`shared/components/forms`, standard MUI labeled inputs, and `Forms.cardStackSpacing`
for separating cards. Both form and summary cards use shared `CardHeading` labels
with small uppercase muted text. Green identifies links, actions, and selected
navigation; brand and success accents retain their semantic colors. Read-only
detail rows stay in summary cards; editable forms
use the shared input presentation, including the full-width signature pad.
Secondary page and dialog actions use text buttons; the main action stays filled.
Horizontal action rows share `shared/components/buttons/actionRowStyles.ts` to
balance visible gaps: adjacent text buttons have no extra gap, and text/filled
pairs have 16px. Form actions retain their standard vertical spacing on mobile.
Request and task chats share `DiscussionThread`: an open section with a small muted
heading whose chevron expands an alphabetical participant list. Request cards and
chat steps share `ExpandableSection`, including its control and transition. The list starts collapsed;
messages stay visible below it. Participants flow horizontally and wrap on narrow
screens. The chat composer uses a MUI input adornment for its attachment button,
with selected files shown below the input. Keep the
conversation free of outer card frames.
Neutral incoming bubbles contrast with green outgoing bubbles.

Status chips sit in request and task card headers and remain visible when a
card is collapsed. Their rounded, softly tinted styling follows the landing
page badges, while their labels, icons, and colors reflect the workflow state.
Empty fields are omitted. Summary and timeline dates use the viewer's locale
and local time, with a readable date and hours/minutes only.

## Cards and intentional variants

All cards use the default themed background without per-card background overrides.
All MUI `Card` instances receive their standard border, radius, no default shadow,
and zero outer padding through the theme. Change `SurfaceTokens.borderRadius` to
adjust card, accordion, and chat bubble corners together. Accordion rounding is
owned by the theme; chat bubble rounding is applied in `DiscussionMessageList`. Do not repeat these defaults through call-site `sx`.

Use `AppCard` with `elevated` for the shared stronger shadow. `AppCardContent`
provides compact content padding, including the last child; ordinary
`CardContent` uses responsive padding of 20px on small screens and 28px on desktop. These shared components own
their presentation. Status borders, selected-plan border colors, and content-specific
layout remain explicit call-site overrides. Focus styling must preserve the
card's themed radius.

The same rule applies to other patterns: use `MainActionButton` for a form's
primary action; keep recurring presentation in its shared component. Extract a
new shared component when repeated markup and behavior justify it, rather than
wrapping every MUI primitive.

## Verification

Run `npm run build`, `npm run lint`, and `npm test -- --run`. Format changed
TypeScript files with Prettier using `--print-width 120`, and organize imports.
For visual changes, check light and dark modes at desktop and mobile widths,
including focus, expanded, and selected states where relevant.
