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

The UI Docker image builds one MkDocs Material site at `/`, with a prototype
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
Keep `docs/content/stylesheets/app.css` aligned with the app theme and shell.
The header and palette overrides in `docs/overrides/partials/` mirror
`PublicAppBar` and `ColorModeSwitch`, including their dimensions, icons, and
colors. `docs/content/javascripts/app-bar.js` connects the accessible switch and
toolbar buttons to Material's existing theme, search, and navigation controls.
The navigation override mirrors the app's 240px left drawer, including its brand
header, section labels, and selected menu rows. It stays open from 1200px and
becomes an overlay menu on smaller screens. Both app and docs drawers keep the
branding row fixed while only the navigation items scroll. Pages use the app's 16px content
padding and compact page titles, without a surrounding article card.
The drawer's right divider starts below its branding row. The app bar uses the
compact app logo without brand text when the main menu is closed; opening the
menu hides the app-bar logo, matching `/app`. Search uses the app's outlined
input styling and a matching results popup, with a visible field at all widths.
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

## Cards and intentional variants

All cards use the default themed background without per-card background overrides.
All MUI `Card` instances receive their standard border, radius, default shadow,
and zero outer padding through the theme. Change `SurfaceTokens.borderRadius` to
adjust card, accordion, and chat bubble corners together. Accordion rounding is
owned by the theme; chat bubble rounding is applied in `DiscussionMessageList`. Do not repeat these defaults through call-site `sx`.

Use `AppCard` with `elevated` for the shared stronger shadow. `AppCardContent`
provides compact content padding, including the last child; ordinary
`CardContent` retains MUI's default bottom padding. These shared components own
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
