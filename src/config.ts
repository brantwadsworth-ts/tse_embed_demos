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
  '--ts-var-root-background': '#0d0d11',
  '--ts-var-root-color': '#f0eaf0',
  '--ts-var-root-font-family': '"Inter", "Segoe UI", "Helvetica Neue", sans-serif',
  '--ts-var-application-color': '#f0eaf0',
  '--ts-var-nav-background': '#0a0a0e',
  '--ts-var-nav-color': '#f0eaf0',
  '--ts-var-search-data-button-background': '#e91e8c',
  '--ts-var-search-data-button-font-color': '#ffffff',
  '--ts-var-search-bar-background': '#17151c',
  '--ts-var-search-bar-text-font-color': '#f0eaf0',
  '--ts-var-button-border-radius': '8px',
  '--ts-var-button--icon-border-radius': '6px',
  '--ts-var-button--primary-background': '#e91e8c',
  '--ts-var-button--primary-color': '#ffffff',
  '--ts-var-button--primary--hover-background': '#c4196f',
  '--ts-var-button--primary--active-background': '#a01459',
  '--ts-var-button--secondary-background': '#2a1a22',
  '--ts-var-button--secondary-color': '#d4c8d4',
  '--ts-var-button--secondary--hover-background': '#e91e8c',
  '--ts-var-button--secondary--hovers-background': '#e91e8c',
  '--ts-var-button--secondary--active-background': '#c4196f',
  '--ts-var-viz-title-color': '#f0eaf0',
  '--ts-var-viz-title-font-family': '"Inter", "Segoe UI", sans-serif',
  '--ts-var-viz-description-color': '#8a7a88',
  '--ts-var-viz-border-radius': '12px',
  '--ts-var-viz-box-shadow': '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 40px rgba(0,0,0,0.6)',
  '--ts-var-viz-background': '#17151c',
  '--ts-var-chip-border-radius': '6px',
  '--ts-var-chip-background': '#2a1a22',
  '--ts-var-chip-color': '#d4c8d4',
  '--ts-var-chip--hover-background': '#e91e8c',
  '--ts-var-chip--hover-color': '#ffffff',
  '--ts-var-chip--active-background': '#e91e8c',
  '--ts-var-chip--active-color': '#ffffff',
  '--ts-var-menu-background': '#17151c',
  '--ts-var-menu-color': '#f0eaf0',
  '--ts-var-menu--hover-background': '#2a1a22',
  '--ts-var-dialog-body-background': '#17151c',
  '--ts-var-dialog-body-color': '#f0eaf0',
  '--ts-var-dialog-header-background': '#0d0d11',
  '--ts-var-dialog-header-color': '#f0eaf0',
  '--ts-var-list-hover-background': '#2a1a22',
  '--ts-var-list-selected-background': '#3a1a2a',
  '--ts-var-liveboard-layout-background': '#0d0d11',
  '--ts-var-liveboard-header-background': '#0a0a0e',
  '--ts-var-liveboard-header-font-color': '#f0eaf0',
  '--ts-var-liveboard-tile-background': '#17151c',
  '--ts-var-liveboard-tile-border-color': '#2a1a22',
  '--ts-var-liveboard-tile-border-radius': '12px',
  '--ts-var-liveboard-tile-padding': '16px',
  '--ts-var-liveboard-tile-table-header-background': '#221520',
  '--ts-var-liveboard-tab-active-border-color': '#e91e8c',
  '--ts-var-liveboard-tab-hover-color': '#e91e8c',
  '--ts-var-liveboard-header-action-button-background': '#2a1a22',
  '--ts-var-liveboard-header-action-button-font-color': '#d4c8d4',
  '--ts-var-liveboard-header-action-button-hover-color': '#e91e8c',
  '--ts-var-liveboard-header-action-button-active-color': '#c4196f',
  '--ts-var-parameter-chip-background': '#2a1a22',
  '--ts-var-parameter-chip-text-color': '#d4c8d4',
  '--ts-var-parameter-chip-hover-background': '#e91e8c',
  '--ts-var-parameter-chip-hover-text-color': '#ffffff',
  '--ts-var-parameter-chip-active-background': '#e91e8c',
  '--ts-var-parameter-chip-active-text-color': '#ffffff',
  '--ts-var-axis-title-color': '#8a7a88',
  '--ts-var-axis-data-label-color': '#6a5a68',
  '--ts-var-kpi-hero-color': '#f0eaf0',
  '--ts-var-kpi-comparison-color': '#8a7a88',
  '--ts-var-kpi-positive-change-color': '#34d399',
  '--ts-var-kpi-negative-change-color': '#f87171',
  '--ts-var-spotter-input-background': '#17151c',
  '--ts-var-spotter-prompt-background': '#2a1a22',
  '--ts-var-sage-embed-background-color': '#0d0d11',
  '--ts-var-sage-bar-header-background-color': '#0a0a0e',
  '--ts-var-sage-search-box-background-color': '#17151c',
  '--ts-var-sage-search-box-font-color': '#f0eaf0',
  '--ts-var-source-selector-background-color': '#17151c',
  '--ts-var-sage-seed-questions-background': '#2a1a22',
  '--ts-var-sage-seed-questions-font-color': '#d4c8d4',
  '--ts-var-sage-seed-questions-hover-background': '#3a1a2a',
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

// Global dark-theme overrides applied to ALL ThoughtSpot embeds (init + per-embed)
export const GLOBAL_DARK_RULES: Record<string, Record<string, string>> = {
  // Force iframe body to dark background
  'body, html': { background: '#0d0d11 !important' },

  // Viz / answer card containers in Spotter conversation results
  '[class*="vizCard"], [class*="VizCard"]': {
    background: '#17151c !important',
    'border-color': '#2a1a22 !important',
  },
  '[class*="answerContainer"], [class*="AnswerContainer"]': {
    background: '#17151c !important',
  },
  '[class*="conversationMessage"], [class*="ConversationMessage"]': {
    background: '#0d0d11 !important',
  },
  '[class*="resultTile"], [class*="ResultTile"], [class*="resultCard"], [class*="ResultCard"]': {
    background: '#17151c !important',
    'border-color': '#2a1a22 !important',
  },
  // Spotter response wrapper
  '[class*="spotterEmbed"], [class*="SpotterEmbed"]': {
    background: '#0d0d11 !important',
  },
  '[class*="embedContainer"], [class*="EmbedContainer"]': {
    background: '#17151c !important',
  },

  // AG Grid row backgrounds (table viz)
  '.ag-row': { background: '#17151c !important' },
  '.ag-row-even': { background: '#17151c !important' },
  '.ag-row-odd': { background: '#1d1a23 !important' },
  '.ag-row:hover, .ag-row-hover': { background: '#221520 !important' },
  '.ag-cell': { 'border-color': '#2a1a22 !important', color: '#f0eaf0 !important' },
  '.ag-header-cell, .ag-header-group-cell': {
    'border-color': '#2a1a22 !important',
    color: '#f0eaf0 !important',
  },
  '.ag-footer-row .ag-cell': {
    background: '#221520 !important',
    color: '#f0eaf0 !important',
  },
  '.ag-root-wrapper, .ag-body-viewport, .ag-center-cols-container': {
    background: '#17151c !important',
  },
  '[class*="vizBody"], [class*="tableViz"], [class*="tableTile"]': {
    background: '#17151c !important',
  },
};

// Alias kept for existing callers
export const LIVEBOARD_TABLE_RULES = GLOBAL_DARK_RULES;

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
