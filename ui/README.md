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

The UI Docker image builds one MkDocs Material site at `/`, with a product
landing page, `/contact/`, `/terms/`, `/privacy/`, and user documentation under
`/docs/`. The documentation root is a table of contents; Getting started lives at
`/docs/getting-started/`. The Docs menu opens `/docs/`; `/docs` redirects to `/docs/`. The React
application is served separately at `/app/`. Terms and privacy are explicitly
marked placeholders and need final content before release.

From `ui/`, install the app dependencies (`npm ci`) and the documentation tools:

```sh
python3 -m venv .venv-docs
.venv-docs/bin/python -m pip install -r docs/requirements.txt
.venv-docs/bin/python -m mkdocs serve --dev-addr 127.0.0.1:8000
```

Preview the landing page at `http://127.0.0.1:8000/` and guides at
`http://127.0.0.1:8000/docs/`. With the Vite development server running,
`http://localhost:3333/` and the public-site paths proxy to MkDocs, while `/app/`
serves React. Use port 3333 to try the complete navigation. Restart an existing
MkDocs preview after changing `site_url`, since its mount path is set at startup.

In VS Code, choose **Tasks: Run Task → run-docs**. This task runs `setup-docs`
first to create the virtual environment and install dependencies, then starts
the preview on port 8000. Both the business and public repository workspaces
provide these tasks. Stop it through **Tasks: Terminate Task**.

The homepage metadata in `docs/content/index.md` selects `docs/overrides/landing.html`.
The landing page walks through creating, signing, and verifying a proposal using
responsive HTML example cards. The cards use the current theme and readable text
at every screen size. Keep the examples explicitly labeled as illustrative and
use fictional people and details; they are explanations rather than app controls.
Supporting pages use `template: marketing.html`; their content stays in Markdown.
User guides live in `docs/content/docs/` and retain the documentation shell. Add
new guides under the appropriate group within Documentation in `mkdocs.yml`; only
those guide groups appear in the documentation drawer. The groups cover getting
started, requests and tasks, business workspaces, account and security, plans and
data, and help. These user guides describe the business service: explain workspace,
role, and plan restrictions without deployment or capability-configuration language.
Use Markdown admonitions for organization-only guidance and important cautions.
Keep the table of contents in `docs/content/docs/index.md` in sidebar order.
The shared `partials/docs-pagination.html` adds Previous, Table of contents, and
Next links to guides automatically using that order. Marketing presentation lives in
`docs/content/stylesheets/marketing.css`; shared public links are in
`docs/overrides/partials/site-footer.html`. The documentation theme uses the app's logo and locally
served Sora font files through `docs/hooks.py`; no external font service is needed.
`docs/content/stylesheets/app.css` owns the shared shell and public-site color
tokens. Guide presentation lives in `docs/content/stylesheets/docs.css`, loaded
only for `/docs/` pages. It follows the landing page's green accents, muted text,
light borders, medium-weight headings, and open spacing in both color modes.
The header and palette overrides in `docs/overrides/partials/` mirror
`PublicAppBar` and `ColorModeSwitch`, including their dimensions, icons, and
colors. `docs/content/javascripts/app-bar.js` connects the accessible switch and
toolbar buttons to Material's existing theme, search, and navigation controls.
The navigation override retains the app's 240px left drawer and brand header,
with quiet section labels and softly highlighted green selected links. It stays open from 1200px and
becomes an overlay menu on smaller screens. Both app and docs drawers keep the
branding row fixed while only the navigation items scroll. Guides fill the available content width and align with the app
using the same responsive gutters, without a centered article column or a
surrounding article card.
The drawer's right divider starts below its branding row. The app bar uses the
compact app logo without brand text when the main menu is closed; opening the
menu hides the app-bar logo, matching `/app`. Search uses a lightly outlined
input and a matching results popup, with a visible field at all widths.
The app and docs share the `colorMode` browser preference, including live updates
across tabs on the same origin. For local development, open docs through Vite's
`/docs/` proxy to share storage with `/app/`.

Build static documentation into `ui/site/` with:

```sh
.venv-docs/bin/python -m mkdocs build --strict
```

Both repositories' CI workflows validate this build. When publishing, optionally
set `DOCS_SITE_URL=https://your-domain.example/` for canonical and sitemap
URLs (or pass `--build-arg DOCS_SITE_URL=https://your-domain.example/` to
`docker build`). The default is `https://click2approve.com/`. Despite the retained variable name,
`DOCS_SITE_URL` now specifies the whole public site origin, not its `/docs/` section.
The build generates `site/index.html`, `site/docs/index.html`, and the supporting
pages. Nginx serves this output at the root and the React output from `/app/`.

The Swagger link uses `http://localhost:5555/swagger/` during `mkdocs serve`.
Static builds use `/swagger/` on the public site's origin, matching the current
production API base URL. If the API runs on a separate host or under a path prefix,
set `DOCS_API_BASE_URI` to that base URL when serving or building the docs (or pass
`--build-arg DOCS_API_BASE_URI=https://api.your-domain.example` to `docker build`).
For a local static build, use `DOCS_API_BASE_URI=http://localhost:5555`.

## Optional analytics

Google Analytics is disabled when `GOOGLE_ANALYTICS_ID` is unset or empty.
To enable it across the app, legacy help, landing page, and docs, pass
`--build-arg GOOGLE_ANALYTICS_ID=G-YOURID` to the UI Docker build, or set the same
environment variable for both Vite and MkDocs builds. Rebuild to change the ID.
See [frontend build settings](../docs/configuration.md#frontend-build-settings).

The container smoke check verifies the selected mode:

```sh
npm run test:nginx
GOOGLE_ANALYTICS_ID=G-ANALYTICSTEST npm run test:nginx
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
