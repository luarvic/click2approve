# Frontend development

The shared React frontend serves both editions. Feature availability comes from
backend capabilities; styling has the same owners in both editions.

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
