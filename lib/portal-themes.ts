// ─────────────────────────────────────────────────────────────────────────────
// Portal Theme System
//
// Each theme is a set of CSS custom-property values that get injected into a
// <style> block on the portal page.  The portal components reference
// var(--portal-*) throughout so swapping the theme is zero-JS.
//
// We also include ThoughtSpot embed customizations so the embedded liveboard
// visually matches the surrounding portal.
// ─────────────────────────────────────────────────────────────────────────────

export type ThemePreset =
  | "light"
  | "dark"
  | "minimal"
  | "glass"
  | "midnight"
  | "custom";

export interface CustomThemeVars {
  /** Page background */
  bg: string;
  /** Card / panel background */
  surface: string;
  /** Slightly elevated surface */
  surface2: string;
  /** Border / divider color */
  border: string;
  /** Primary text */
  text: string;
  /** Secondary / muted text */
  textMuted: string;
  /** Accent / brand color */
  accent: string;
  /** Text on accent backgrounds */
  accentFg: string;
  /** Header bar background */
  headerBg: string;
  /** Header bar text */
  headerText: string;
  /** Input background */
  inputBg: string;
  /** Border-radius: small elements (buttons, badges) */
  radiusSm: string;
  /** Border-radius: default (inputs, cards) */
  radius: string;
  /** Border-radius: large containers */
  radiusLg: string;
  /** Card shadow */
  shadow: string;
  /** Elevated shadow */
  shadowLg: string;
  /** Font family stack */
  font: string;
}

export interface PortalThemeConfig {
  preset: ThemePreset;
  /** Only used when preset === "custom" */
  custom?: Partial<CustomThemeVars>;
}

// ── Built-in theme definitions ────────────────────────────────────────────────

const THEMES: Record<Exclude<ThemePreset, "custom">, CustomThemeVars> = {

  light: {
    bg: "#f5f7fa",
    surface: "#ffffff",
    surface2: "#f8fafc",
    border: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
    accent: "#2770ef",
    accentFg: "#ffffff",
    headerBg: "#ffffff",
    headerText: "#0f172a",
    inputBg: "#ffffff",
    radiusSm: "6px",
    radius: "10px",
    radiusLg: "16px",
    shadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.05)",
    shadowLg: "0 4px 6px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.08)",
    font: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },

  dark: {
    bg: "#0d1117",
    surface: "#161b22",
    surface2: "#1c2333",
    border: "#30363d",
    text: "#e6edf3",
    textMuted: "#7d8590",
    accent: "#2f81f7",
    accentFg: "#ffffff",
    headerBg: "#161b22",
    headerText: "#e6edf3",
    inputBg: "#0d1117",
    radiusSm: "6px",
    radius: "10px",
    radiusLg: "16px",
    shadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
    shadowLg: "0 4px 6px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.5)",
    font: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },

  minimal: {
    bg: "#ffffff",
    surface: "#ffffff",
    surface2: "#fafafa",
    border: "#ebebeb",
    text: "#111111",
    textMuted: "#888888",
    accent: "#000000",
    accentFg: "#ffffff",
    headerBg: "#ffffff",
    headerText: "#111111",
    inputBg: "#fafafa",
    radiusSm: "2px",
    radius: "4px",
    radiusLg: "4px",
    shadow: "none",
    shadowLg: "0 1px 0 rgba(0,0,0,0.08)",
    font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },

  glass: {
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
    surface: "rgba(255,255,255,0.08)",
    surface2: "rgba(255,255,255,0.12)",
    border: "rgba(255,255,255,0.15)",
    text: "#ffffff",
    textMuted: "rgba(255,255,255,0.6)",
    accent: "#e94560",
    accentFg: "#ffffff",
    headerBg: "rgba(10,10,20,0.6)",
    headerText: "#ffffff",
    inputBg: "rgba(255,255,255,0.07)",
    radiusSm: "8px",
    radius: "12px",
    radiusLg: "20px",
    shadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    shadowLg: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
    font: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },

  midnight: {
    bg: "#070b14",
    surface: "#0e1628",
    surface2: "#131d35",
    border: "#1e2d4d",
    text: "#e2e8f0",
    textMuted: "#4a6080",
    accent: "#6366f1",
    accentFg: "#ffffff",
    headerBg: "#0e1628",
    headerText: "#e2e8f0",
    inputBg: "#070b14",
    radiusSm: "8px",
    radius: "12px",
    radiusLg: "20px",
    shadow: "0 0 0 1px rgba(99,102,241,0.1), 0 4px 24px rgba(0,0,0,0.6)",
    shadowLg: "0 0 0 1px rgba(99,102,241,0.15), 0 8px 48px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.08)",
    font: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Resolve the full theme vars for any preset (merges custom overrides). */
export function resolveTheme(config?: PortalThemeConfig): CustomThemeVars {
  if (!config || config.preset === "light") return THEMES.light;
  if (config.preset === "custom") {
    return { ...THEMES.light, ...(config.custom ?? {}) };
  }
  return THEMES[config.preset];
}

/** Generate a <style> block CSS string from a theme. */
export function themeToCSS(vars: CustomThemeVars): string {
  return `
:root {
  --portal-bg: ${vars.bg};
  --portal-surface: ${vars.surface};
  --portal-surface-2: ${vars.surface2};
  --portal-border: ${vars.border};
  --portal-text: ${vars.text};
  --portal-text-muted: ${vars.textMuted};
  --portal-accent: ${vars.accent};
  --portal-accent-fg: ${vars.accentFg};
  --portal-header-bg: ${vars.headerBg};
  --portal-header-text: ${vars.headerText};
  --portal-input-bg: ${vars.inputBg};
  --portal-radius-sm: ${vars.radiusSm};
  --portal-radius: ${vars.radius};
  --portal-radius-lg: ${vars.radiusLg};
  --portal-shadow: ${vars.shadow};
  --portal-shadow-lg: ${vars.shadowLg};
  --portal-font: ${vars.font};
}
html, body { background: var(--portal-bg); color: var(--portal-text); font-family: var(--portal-font); }
* { box-sizing: border-box; }
`.trim();
}

/**
 * ThoughtSpot embed customizations that match each theme.
 * These are passed to the init() call via the `customizations` option.
 */
export function themeToTSCustomizations(vars: CustomThemeVars): object {
  return {
    style: {
      customCSS: {
        variables: {
          "--ts-var-root-background": vars.bg.startsWith("linear") ? "#0f1628" : vars.bg,
          "--ts-var-root-color": vars.text,
          "--ts-var-nav-background": vars.headerBg,
          "--ts-var-nav-color": vars.headerText,
          "--ts-var-button--primary-background": vars.accent,
          "--ts-var-button--primary-color": vars.accentFg,
          "--ts-var-button--secondary-background": vars.surface2,
          "--ts-var-button--secondary-color": vars.text,
          "--ts-var-chip-background": vars.surface2,
          "--ts-var-chip-color": vars.text,
          "--ts-var-chip-border-color": vars.border,
          "--ts-var-segment-title-color": vars.textMuted,
        },
      },
    },
  };
}

/** Human-readable label for each preset. */
export const THEME_META: Record<ThemePreset, { label: string; description: string; emoji: string }> = {
  light:    { label: "Light",    description: "Clean white with subtle shadows",            emoji: "☀️" },
  dark:     { label: "Dark",     description: "GitHub-style dark mode",                     emoji: "🌙" },
  minimal:  { label: "Minimal",  description: "Stark white, no shadows, sharp edges",       emoji: "⬜" },
  glass:    { label: "Glass",    description: "Frosted glass on deep navy gradient",         emoji: "🔮" },
  midnight: { label: "Midnight", description: "Deep space with indigo glow",                emoji: "✨" },
  custom:   { label: "Custom",   description: "Configure every detail yourself",            emoji: "🎨" },
};

export { THEMES };
