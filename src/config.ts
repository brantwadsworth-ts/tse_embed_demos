// ---------------------------------------------------------------------------
// Kearney SpendPro — ThoughtSpot embed configuration
// ---------------------------------------------------------------------------

export const THOUGHTSPOT_HOST = 'https://kearney.thoughtspot.cloud';

export const ANALYTICS_LIVEBOARD_ID = '630a97bb-7cf9-4bbe-9d48-506a5781beae';

export const WORKSHEET_ID = '655683cf-b98b-457b-a936-bd446f3ab401';

export const SPOTTER_NAME = 'Merlin';

export const CHATBOT_WELCOME =
  "Hi, I'm Merlin — your Kearney SpendPro AI assistant. Ask me about spend by category, supplier concentration, or cost-saving opportunities.";

export const SAMPLE_QUESTIONS = [
  'Total spend by category L0',
  'Top 20 suppliers by spend',
  'Spend by region this year',
  'Monthly spend trend',
];

export const LIVEBOARD_EMBED_FLAGS = {
  enable2ColumnLayout: true,
  isLiveboardStylingAndGroupingEnabled: true,
};

export const SPOTTER_EMBED_FLAGS = {
  updatedSpotterChatPrompt: true,
  spotterSidebarConfig: {
    enablePastConversationsSidebar: true,
    spotterSidebarTitle: 'My Conversations',
    spotterSidebarDefaultExpanded: false,
  },
};

// ---------------------------------------------------------------------------
// Kearney SpendPro — CSS variables (dark navy theme)
// ---------------------------------------------------------------------------

export const TS_CSS_VARIABLES: Record<string, string> = {
  '--ts-var-root-background': '#0e1520',
  '--ts-var-root-color': '#e0e8f2',
  '--ts-var-root-font-family': '"Inter", "Segoe UI", "Helvetica Neue", sans-serif',
  '--ts-var-application-color': '#e0e8f2',
  '--ts-var-nav-background': '#0b1118',
  '--ts-var-nav-color': '#e0e8f2',
  '--ts-var-search-data-button-background': '#0096D6',
  '--ts-var-search-data-button-font-color': '#ffffff',
  '--ts-var-search-bar-background': '#131d2b',
  '--ts-var-search-bar-text-font-color': '#e0e8f2',
  '--ts-var-button-border-radius': '8px',
  '--ts-var-button--icon-border-radius': '6px',
  '--ts-var-button--primary-background': '#0096D6',
  '--ts-var-button--primary-color': '#ffffff',
  '--ts-var-button--primary--hover-background': '#007bb5',
  '--ts-var-button--primary--active-background': '#00619a',
  '--ts-var-button--secondary-background': '#1a2640',
  '--ts-var-button--secondary-color': '#c8d8e8',
  '--ts-var-button--secondary--hover-background': '#0096D6',
  '--ts-var-button--secondary--hovers-background': '#0096D6',
  '--ts-var-button--secondary--active-background': '#007bb5',
  '--ts-var-viz-title-color': '#e0e8f2',
  '--ts-var-viz-title-font-family': '"Inter", "Segoe UI", sans-serif',
  '--ts-var-viz-description-color': '#8aa0bc',
  '--ts-var-viz-border-radius': '12px',
  '--ts-var-viz-box-shadow': '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 40px rgba(0,0,0,0.5)',
  '--ts-var-viz-background': '#131d2b',
  '--ts-var-chip-border-radius': '6px',
  '--ts-var-chip-background': '#1a2640',
  '--ts-var-chip-color': '#c8d8e8',
  '--ts-var-chip--hover-background': '#0096D6',
  '--ts-var-chip--hover-color': '#ffffff',
  '--ts-var-chip--active-background': '#0096D6',
  '--ts-var-chip--active-color': '#ffffff',
  '--ts-var-menu-background': '#131d2b',
  '--ts-var-menu-color': '#e0e8f2',
  '--ts-var-menu--hover-background': '#1a2640',
  '--ts-var-dialog-body-background': '#131d2b',
  '--ts-var-dialog-body-color': '#e0e8f2',
  '--ts-var-dialog-header-background': '#0e1520',
  '--ts-var-dialog-header-color': '#e0e8f2',
  '--ts-var-list-hover-background': '#1a2640',
  '--ts-var-list-selected-background': '#1f3050',
  '--ts-var-liveboard-layout-background': '#0e1520',
  '--ts-var-liveboard-header-background': '#0b1118',
  '--ts-var-liveboard-header-font-color': '#e0e8f2',
  '--ts-var-liveboard-tile-background': '#131d2b',
  '--ts-var-liveboard-tile-border-color': '#1f3050',
  '--ts-var-liveboard-tile-border-radius': '12px',
  '--ts-var-liveboard-tile-padding': '16px',
  '--ts-var-liveboard-tile-table-header-background': '#172235',
  '--ts-var-liveboard-tab-active-border-color': '#0096D6',
  '--ts-var-liveboard-tab-hover-color': '#0096D6',
  '--ts-var-liveboard-header-action-button-background': '#1a2640',
  '--ts-var-liveboard-header-action-button-font-color': '#c8d8e8',
  '--ts-var-liveboard-header-action-button-hover-color': '#0096D6',
  '--ts-var-liveboard-header-action-button-active-color': '#007bb5',
  '--ts-var-parameter-chip-background': '#1a2640',
  '--ts-var-parameter-chip-text-color': '#c8d8e8',
  '--ts-var-parameter-chip-hover-background': '#0096D6',
  '--ts-var-parameter-chip-hover-text-color': '#ffffff',
  '--ts-var-parameter-chip-active-background': '#0096D6',
  '--ts-var-parameter-chip-active-text-color': '#ffffff',
  '--ts-var-axis-title-color': '#8aa0bc',
  '--ts-var-axis-data-label-color': '#7090aa',
  '--ts-var-kpi-hero-color': '#e0e8f2',
  '--ts-var-kpi-comparison-color': '#8aa0bc',
  '--ts-var-kpi-positive-change-color': '#34d399',
  '--ts-var-kpi-negative-change-color': '#f87171',
  '--ts-var-spotter-input-background': '#131d2b',
  '--ts-var-spotter-prompt-background': '#1a2640',
  '--ts-var-sage-embed-background-color': '#0e1520',
  '--ts-var-sage-bar-header-background-color': '#0b1118',
  '--ts-var-sage-search-box-background-color': '#131d2b',
  '--ts-var-sage-search-box-font-color': '#e0e8f2',
  '--ts-var-source-selector-background-color': '#131d2b',
  '--ts-var-sage-seed-questions-background': '#1a2640',
  '--ts-var-sage-seed-questions-font-color': '#c8d8e8',
  '--ts-var-sage-seed-questions-hover-background': '#1f3050',
};

export type ThemeName = 'dark';

export function tsVarsFor(_theme: ThemeName): Record<string, string> {
  return TS_CSS_VARIABLES;
}

export const TS_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';

export const TS_STRINGS: Record<string, string> = {
  Spotter: SPOTTER_NAME,
};

export const TS_STRING_IDS: Record<string, string> = {
  'convAssist.landingpage.description2': 'Ask a question about procurement spend.',
};

const HIDE = { display: 'none !important' };
export const HIDE_SPOTTER_INPUT_RULES: Record<string, Record<string, string>> = {
  '[class*="composer" i]': HIDE,
  '[class*="promptInput" i]': HIDE,
  '[class*="prompt-input" i]': HIDE,
  '[class*="chatInput" i]': HIDE,
  '[class*="conversationInput" i]': HIDE,
  '[class*="conversationFooter" i]': HIDE,
  '[class*="bottomBar" i]': HIDE,
  '[class*="searchInputContainer" i]': HIDE,
};
