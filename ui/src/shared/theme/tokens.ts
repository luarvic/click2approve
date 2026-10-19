export const SurfaceTokens = {
  borderRadius: "12px",
} as const;
export const ControlTokens = {
  borderRadius: "6px",
} as const;
export const StackSpacing = {
  none: 0,
  tight: 0.5,
  default: 1,
  relaxed: 1.5,
  loose: 2,
  extraLoose: 6,
} as const;

// Keep aligned with the public-site colors in docs/content/stylesheets/app.css.
export const SitePaletteTokens = {
  light: {
    accent: "#15803d",
    soft: "#f2f7f3",
    ink: "#162b20",
    muted: "#52645a",
    background: "#ffffff",
  },
  dark: {
    accent: "#4ade80",
    soft: "#19251e",
    ink: "#edf7f0",
    muted: "#a6baad",
    background: "#121212",
  },
} as const;
