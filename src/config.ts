// ---------------------------------------------------------------------------
// Central configuration for the Montana DPHHS MIDIS Disease Surveillance Portal.
// ---------------------------------------------------------------------------

/** ThoughtSpot cluster for Montana DPHHS / MIDIS. */
export const THOUGHTSPOT_HOST = 'https://se-thoughtspot-cloud.thoughtspot.cloud';

/** ACR (Annual Case Report) liveboard — main liveboard for this portal. */
export const ACR_LIVEBOARD_ID = '403cdd3c-8f81-4a51-80ce-5666a1c35e40';

/** MIDIS Reconciliation Data model — used for search, gauges, and Spotter. */
export const WORKSHEET_ID = '1480ab38-5900-4b6b-9a50-b3131595c2d6';

/** Alias kept for compatibility — points to the same MIDIS model. */
export const CADENCE_WORKSHEET_ID = WORKSHEET_ID;

/** Analytics liveboard (reuses ACR liveboard for Montana demo). */
export const ANALYTICS_LIVEBOARD_ID = ACR_LIVEBOARD_ID;

/** Inline insights liveboard. */
export const INLINE_INSIGHTS_LIVEBOARD_ID = ACR_LIVEBOARD_ID;

/** Saved Answer previously embedded on the Signals tab (kept for reference). */
export const SIGNALS_ANSWER_ID = 'cd7bd15c-a207-4bde-aef1-ed0a6e3dad06';

/**
 * Signals tab now embeds a single VISUALIZATION from the Analytics liveboard
 * (LiveboardEmbed + liveboardId + vizId), not a saved Answer.
 */
export const SIGNALS_VIZ_ID = 'ab68d5d8-6cf0-43bc-bccd-4f5caca665a2';

/** Code-based custom action ("Re-engage cadence") on the Signals answer. */
export const REENGAGE_ACTION_ID = 'reengage-cadence';
export const REENGAGE_ACTION_NAME = 'Re-engage cadence';

/**
 * Candidate column names for "cadence" on the worksheet. The first one that
 * returns data is used both to list cadence names and as the runtime-filter
 * column name on the inline liveboard.
 */
export const CADENCE_COLUMN_CANDIDATES = [
  'Cadence Name',
  'Cadence',
  'Cadence Step Name',
  'Cadence Step',
];

/**
 * Candidate column names for the per-cadence detail metrics shown next to each
 * cadence in the Inline Insights UI. The first candidate that returns data for
 * each metric is used; metrics with no match are simply omitted.
 */
export const CADENCE_DETAIL_COLUMNS: Record<
  'owner' | 'created' | 'emailsReplied' | 'influencedPipeline',
  { label: string; format: 'text' | 'date' | 'number' | 'currency'; candidates: string[] }
> = {
  owner: {
    label: 'Owner',
    format: 'text',
    candidates: ['Cadence Owner', 'Owner', 'Cadence Creator', 'Created By', 'Owner Name'],
  },
  created: {
    label: 'Created',
    format: 'date',
    candidates: ['Cadence Create Date', 'Create Date', 'Created Date', 'Cadence Created Date', 'Created'],
  },
  emailsReplied: {
    label: 'Emails Replied',
    format: 'number',
    candidates: ['Emails Replied', 'Email Replies', 'Replies', 'Total Emails Replied', 'Reply Count'],
  },
  influencedPipeline: {
    label: 'Influenced Pipeline',
    format: 'currency',
    candidates: ['Influenced Pipeline', 'Pipeline Influenced', 'Influenced Pipeline Amount', 'Pipeline'],
  },
};

// ---------------------------------------------------------------------------
// ThoughtSpot embed styling — Montana navy/gold theme
// salesloft_fin.json structure preserved for SDK compatibility
// ---------------------------------------------------------------------------

/** CSS variables applied to every embedded ThoughtSpot surface — Montana navy/gold theme. */
export const TS_CSS_VARIABLES: Record<string, string> = {
  '--ts-var-root-background': '#F7F8FA',
  '--ts-var-root-color': '#1a2533',
  '--ts-var-root-font-family': '"Inter", "Segoe UI", Arial, sans-serif',
  '--ts-var-application-color': '#003865',
  '--ts-var-nav-background': '#FFFFFF',
  '--ts-var-nav-color': '#003865',
  '--ts-var-search-data-button-background': '#003865',
  '--ts-var-search-data-button-font-color': '#FFFFFF',
  '--ts-var-search-bar-background': '#EEF2F7',
  '--ts-var-search-bar-text-font-color': '#003865',
  '--ts-var-button-border-radius': '6px',
  '--ts-var-button--icon-border-radius': '4px',
  '--ts-var-button--primary-background': '#003865',
  '--ts-var-button--primary-color': '#FFFFFF',
  '--ts-var-button--primary--hover-background': '#002a4e',
  '--ts-var-button--primary--active-background': '#001f38',
  '--ts-var-button--secondary-background': '#E6EDF5',
  '--ts-var-button--secondary-color': '#003865',
  '--ts-var-button--secondary--hover-background': '#D4E0EE',
  '--ts-var-button--secondary--hovers-background': '#D4E0EE',
  '--ts-var-button--secondary--active-background': '#C2D3E6',
  '--ts-var-viz-title-color': '#1a2533',
  '--ts-var-viz-title-font-family': '"Inter", "Segoe UI", Arial, sans-serif',
  '--ts-var-viz-description-color': '#4a5568',
  '--ts-var-viz-border-radius': '8px',
  '--ts-var-viz-box-shadow': '0 1px 3px rgba(0,56,101,0.08), 0 8px 24px rgba(0,56,101,0.10)',
  '--ts-var-viz-background': '#FFFFFF',
  '--ts-var-chip-border-radius': '4px',
  '--ts-var-chip-background': '#E6EDF5',
  '--ts-var-chip-color': '#003865',
  '--ts-var-chip--hover-background': '#D4E0EE',
  '--ts-var-chip--hover-color': '#002a4e',
  '--ts-var-chip--active-background': '#003865',
  '--ts-var-chip--active-color': '#FFFFFF',
  '--ts-var-menu-background': '#FFFFFF',
  '--ts-var-menu-color': '#1a2533',
  '--ts-var-menu--hover-background': '#EEF2F7',
  '--ts-var-dialog-body-background': '#FFFFFF',
  '--ts-var-dialog-body-color': '#1a2533',
  '--ts-var-dialog-header-background': '#FFFFFF',
  '--ts-var-dialog-header-color': '#003865',
  '--ts-var-list-hover-background': '#EEF2F7',
  '--ts-var-list-selected-background': '#D4E0EE',
  '--ts-var-liveboard-layout-background': '#F7F8FA',
  '--ts-var-liveboard-header-background': '#FFFFFF',
  '--ts-var-liveboard-header-font-color': '#003865',
  '--ts-var-liveboard-tile-background': '#FFFFFF',
  '--ts-var-liveboard-tile-border-color': '#CBD5E0',
  '--ts-var-liveboard-tile-border-radius': '8px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#EEF2F7',
  '--ts-var-liveboard-tab-active-border-color': '#DAAA00',
  '--ts-var-liveboard-tab-hover-color': '#003865',
  '--ts-var-liveboard-header-action-button-background': '#E6EDF5',
  '--ts-var-liveboard-header-action-button-font-color': '#003865',
  '--ts-var-liveboard-header-action-button-hover-color': '#D4E0EE',
  '--ts-var-liveboard-header-action-button-active-color': '#C2D3E6',
  '--ts-var-parameter-chip-background': '#E6EDF5',
  '--ts-var-parameter-chip-text-color': '#003865',
  '--ts-var-parameter-chip-hover-background': '#D4E0EE',
  '--ts-var-parameter-chip-hover-text-color': '#002a4e',
  '--ts-var-parameter-chip-active-background': '#003865',
  '--ts-var-parameter-chip-active-text-color': '#FFFFFF',
  '--ts-var-axis-title-color': '#4a5568',
  '--ts-var-axis-data-label-color': '#718096',
  '--ts-var-kpi-hero-color': '#003865',
  '--ts-var-kpi-comparison-color': '#4a5568',
  '--ts-var-kpi-positive-change-color': '#22863a',
  '--ts-var-kpi-negative-change-color': '#c0392b',
};

export type ThemeName = 'light' | 'dark';

/**
 * Dark counterpart to TS_CSS_VARIABLES — a deep-evergreen dark theme that keeps
 * Salesloft's green/coral accents. Passed per-embed for the active theme so the
 * embedded Liveboard / Search / Spotter track the host app's light/dark toggle.
 *   CSS variables: https://developers.thoughtspot.com/docs/css-variables-reference
 */
export const TS_VARS_DARK: Record<string, string> = {
  '--ts-var-root-background': '#0c1f1a',
  '--ts-var-root-color': '#e8f0ec',
  '--ts-var-root-secondary-color': '#93a89f',
  '--ts-var-root-font-family': '"Plus Jakarta Sans", "Avenir Next", "Segoe UI", sans-serif',
  '--ts-var-application-color': '#e8f0ec',
  '--ts-var-nav-background': '#0a1a15',
  '--ts-var-nav-color': '#e8f0ec',
  '--ts-var-search-data-button-background': '#1bb978',
  '--ts-var-search-data-button-font-color': '#06120e',
  '--ts-var-search-bar-background': '#102a23',
  '--ts-var-search-bar-text-font-color': '#e8f0ec',
  '--ts-var-search-auto-complete-background': '#102a23',
  '--ts-var-search-auto-complete-font-color': '#e8f0ec',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  // Deeper green + white text so labels stay readable (incl. on hover).
  '--ts-var-button--primary-background': '#0f9a63',
  '--ts-var-button--primary-color': '#ffffff',
  '--ts-var-button--primary--hover-background': '#0c8554',
  '--ts-var-button--primary--active-background': '#0a744a',
  '--ts-var-button--secondary-background': '#183a30',
  '--ts-var-button--secondary-color': '#e8f0ec',
  // NOTE: the SDK's *effective* var name is the typo'd "--hovers-background"
  // (default #aac2f8, a light blue) — the clean "--hover-background" is only in
  // the docs. Set both so the label stays readable on hover.
  '--ts-var-button--secondary--hover-background': '#0f9a63',
  '--ts-var-button--secondary--hovers-background': '#0f9a63',
  '--ts-var-button--secondary--active-background': '#0c8554',
  '--ts-var-button--tertiary-background': 'transparent',
  '--ts-var-button--tertiary-color': '#c2d3cb',
  '--ts-var-button--tertiary--hover-background': '#183a30',
  '--ts-var-viz-title-color': '#e8f0ec',
  '--ts-var-viz-title-font-family': '"Fraunces", "Iowan Old Style", "Georgia", serif',
  '--ts-var-viz-description-color': '#93a89f',
  '--ts-var-viz-border-radius': '18px',
  '--ts-var-viz-box-shadow':
    '0 1px 0 rgba(255,255,255,0.05) inset, 0 14px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(27,185,120,0.10)',
  '--ts-var-viz-background': '#102a23',
  '--ts-var-viz-legend-hover-background': '#183a30',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#183a30',
  '--ts-var-chip-color': '#c2d3cb',
  '--ts-var-chip--hover-background': '#204438',
  '--ts-var-chip--hover-color': '#e8f0ec',
  '--ts-var-chip--active-background': '#1bb978',
  '--ts-var-chip--active-color': '#06120e',
  '--ts-var-menu-background': '#102a23',
  '--ts-var-menu-color': '#e8f0ec',
  '--ts-var-menu--hover-background': '#183a30',
  '--ts-var-menu-selected-text-color': '#1bb978',
  '--ts-var-menu-separator-background': '#204438',
  '--ts-var-dialog-body-background': '#102a23',
  '--ts-var-dialog-body-color': '#e8f0ec',
  '--ts-var-dialog-header-background': '#102a23',
  '--ts-var-dialog-header-color': '#e8f0ec',
  '--ts-var-dialog-footer-background': '#102a23',
  '--ts-var-list-hover-background': '#183a30',
  '--ts-var-list-selected-background': '#204438',
  '--ts-var-liveboard-layout-background': '#0a1a15',
  '--ts-var-liveboard-header-background': '#0c1f1a',
  '--ts-var-liveboard-header-font-color': '#e8f0ec',
  '--ts-var-liveboard-edit-bar-background': '#102a23',
  '--ts-var-liveboard-cross-filter-layout-background': '#102a23',
  '--ts-var-liveboard-tile-background': '#102a23',
  '--ts-var-liveboard-tile-border-color': '#204438',
  '--ts-var-liveboard-tile-border-radius': '18px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#143329',
  '--ts-var-liveboard-tab-active-border-color': '#1bb978',
  '--ts-var-liveboard-tab-hover-color': '#1bb978',
  '--ts-var-liveboard-header-action-button-background': '#183a30',
  '--ts-var-liveboard-header-action-button-font-color': '#e8f0ec',
  // NOTE: despite "-color", these are the button's hover/active BACKGROUND.
  // Label is light here, so keep the hover background DARK green for contrast.
  '--ts-var-liveboard-header-action-button-hover-color': '#0f9a63',
  '--ts-var-liveboard-header-action-button-active-color': '#0c8554',
  // Masterpieces grouping/styling (active because isLiveboardMasterpiecesEnabled)
  '--ts-var-liveboard-group-background': '#0a1a15',
  '--ts-var-liveboard-group-title-font-color': '#e8f0ec',
  '--ts-var-liveboard-group-border-color': '#204438',
  '--ts-var-liveboard-group-description-font-color': '#93a89f',
  '--ts-var-liveboard-group-tile-title-font-color': '#e8f0ec',
  '--ts-var-liveboard-group-tile-description-font-color': '#93a89f',
  '--ts-var-parameter-chip-background': '#183a30',
  '--ts-var-parameter-chip-text-color': '#e8f0ec',
  '--ts-var-parameter-chip-hover-background': '#204438',
  '--ts-var-parameter-chip-hover-text-color': '#ffffff',
  '--ts-var-parameter-chip-active-background': '#1bb978',
  '--ts-var-parameter-chip-active-text-color': '#06120e',
  '--ts-var-axis-title-color': '#93a89f',
  '--ts-var-axis-data-label-color': '#a9bdb4',
  '--ts-var-answer-data-panel-background-color': '#0a1a15',
  '--ts-var-answer-edit-panel-background-color': '#0a1a15',
  '--ts-var-kpi-hero-color': '#e8f0ec',
  '--ts-var-kpi-comparison-color': '#93a89f',
  '--ts-var-kpi-positive-change-color': '#35c98a',
  '--ts-var-kpi-negative-change-color': '#ff7a6b',
  // Spotter / Sage conversational surfaces
  '--ts-var-spotter-input-background': '#102a23',
  '--ts-var-spotter-prompt-background': '#183a30',
  '--ts-var-sage-embed-background-color': '#0c1f1a',
  '--ts-var-sage-bar-header-background-color': '#0c1f1a',
  '--ts-var-sage-search-box-background-color': '#102a23',
  '--ts-var-sage-search-box-font-color': '#e8f0ec',
  '--ts-var-source-selector-background-color': '#102a23',
  '--ts-var-sage-seed-questions-background': '#102a23',
  '--ts-var-sage-seed-questions-font-color': '#c2d3cb',
  '--ts-var-sage-seed-questions-hover-background': '#183a30',
};

/** Return the CSS-variable set for the active theme. */
export function tsVarsFor(theme: ThemeName): Record<string, string> {
  return theme === 'dark' ? TS_VARS_DARK : TS_CSS_VARIABLES;
}

/**
 * Dark-only color overrides for surfaces with no dedicated CSS variable (answer
 * cards, floating chrome), plus the KPI headline in the Salesloft green. Applied
 * via rules_UNSTABLE only in dark mode.
 *   Docs: https://developers.thoughtspot.com/docs/css-rules
 */
const DARK_SURFACE = '#102a23';
const DARK_INK = '#e8f0ec';
const surfaceRule = { 'background-color': `${DARK_SURFACE} !important`, color: `${DARK_INK} !important` };
export const TS_RULES_DARK: Record<string, Record<string, string>> = {
  // Text inputs / textareas / field wrappers.
  [[
    'input:not([type="checkbox"]):not([type="radio"])',
    'textarea',
    '[class*="input" i]',
    '[class*="field" i]',
    '[class*="searchbox" i]',
  ].join(',')]: { 'background-color': '#0b1f19 !important', color: `${DARK_INK} !important` },
  // Segmented controls / toggles / switchers (e.g. Quick Search | Deep Analysis).
  [[
    '[class*="toggle" i]',
    '[class*="switch" i]',
    '[class*="switcher" i]',
    '[class*="segment" i]',
  ].join(',')]: surfaceRule,
  // Dropdown / select header (dimension & filter pickers).
  '[data-testid="select-dropdown-header"]': { 'background-color': '#0b1f19 !important', color: `${DARK_INK} !important` },
  // Answer / conversation / Spotter / Sage surfaces + the conversations sidebar.
  [[
    '[class*="answer" i]',
    '[class*="conversation" i]',
    '[class*="message" i]',
    '[class*="spotter" i]',
    '[class*="sage" i]',
    '[class*="sidebar" i]',
    '[class*="history" i]',
  ].join(',')]: surfaceRule,
  // Floating chrome — panels / modals / menus / footers.
  [[
    '[class*="modal" i]',
    '[class*="dialog" i]',
    '[class*="popover" i]',
    '[class*="flyout" i]',
    '[class*="drawer" i]',
    '[class*="data-panel" i]',
    '[class*="dataPanel" i]',
    '[class*="footer" i]',
  ].join(',')]: surfaceRule,
};

/**
 * Welcome message for the MIDIS AI chatbot.
 */
export const CHATBOT_WELCOME =
  `Hi! I'm MIDIS AI. Ask me a question about your disease surveillance data — like 'show case counts by jurisdiction' or 'completeness by diagnosis date'.`;

/** Greeting used when the chatbot is opened on a case tracking view. */
export const CHATBOT_CADENCES_WELCOME =
  'What would you like to know about the cases shown here?';

/** Spotter icon sprite. */
export const TS_ICON_SPRITE_URL =
  'https://cdn.jsdelivr.net/gh/thoughtspot/tse-demo-builders-pre-built/icons/spotter/generic-02.svg';

/**
 * String customizations — replace "Spotter" with "MIDIS AI" across all embeds.
 */
export const TS_STRINGS: Record<string, string> = {
  Spotter: 'MIDIS AI',
};

export const TS_STRING_IDS: Record<string, string> = {
  'convAssist.landingpage.description2': 'Ask a question about disease surveillance data.',
};

// ---------------------------------------------------------------------------
// Embed flags — from salesloft_fin.json > stylingConfig.embedFlags
// ---------------------------------------------------------------------------

export const LIVEBOARD_EMBED_FLAGS = {
  enable2ColumnLayout: true,
  isLiveboardStylingAndGroupingEnabled: true,
};

export const SPOTTER_EMBED_FLAGS = {
  updatedSpotterChatPrompt: true,
  spotterSidebarConfig: {
    enablePastConversationsSidebar: true,
    spotterSidebarTitle: 'My Conversations',
    // Start collapsed so the answer canvas gets full width when Spotter opens.
    spotterSidebarDefaultExpanded: false,
  },
};

/** Google-Fonts stylesheet loaded INTO embed iframes — Inter for Montana portal. */
export const TS_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';

/** Sample questions shown on the MIDIS AI landing pane. */
export const SALESLOFT_SAMPLE_QUESTIONS = [
  'Case counts by jurisdiction',
  'Completeness by diagnosis date',
  'Cases closed by month',
  'HIV referral rate by county',
];

export const SALESLOFT_TRIAL_QUESTIONS = 20;
export const SALESLOFT_UPGRADE_URL = '';
export const SALESLOFT_VIDEO_URL = '';

/**
 * Hide the Spotter embed's own composer / input bar on the Salesloft AI screen
 * — questions are driven from the host-side pane on the right, so the in-embed
 * "Enter your question" box (and its Quick/Deep toggle) is redundant. Injected
 * via rules_UNSTABLE. Class names are version-fragile; verify via Inspect if a
 * release renames them.
 */
const HIDE = { display: 'none !important' };
export const HIDE_SPOTTER_INPUT_RULES: Record<string, Record<string, string>> = {
  '[class*="composer" i]': HIDE,
  '[class*="promptInput" i]': HIDE,
  '[class*="prompt-input" i]': HIDE,
  '[class*="chatInput" i]': HIDE,
  '[class*="chat-input" i]': HIDE,
  '[class*="conversationInput" i]': HIDE,
  '[class*="conversation-input" i]': HIDE,
  '[class*="conversationFooter" i]': HIDE,
  '[class*="conversation-footer" i]': HIDE,
  '[class*="bottomBar" i]': HIDE,
  '[class*="searchInputContainer" i]': HIDE,
  '[data-testid*="conversation-input" i]': HIDE,
  '[data-testid*="spotter-input" i]': HIDE,
};

// ---------------------------------------------------------------------------
// Host-side filters on the Analytics liveboard.
//   Hierarchy: OWNER_COLUMN → CADENCE_NAME_COLUMN. Date: DATE_COLUMN.
// Option lists are fetched from FILTER_SOURCE_ID via the searchdata REST API;
// selections are pushed to the liveboard as runtime filters. Column names must
// match the data source's column display names for the runtime filter to bind.
//   Runtime filters: https://developers.thoughtspot.com/docs/runtime-filters
// ---------------------------------------------------------------------------

/**
 * Model queried for the filter option lists (same model the liveboard uses).
 * Hierarchy: SEGMENT_COLUMN → REP_COLUMN → CADENCE_NAME_COLUMN. Date: DATE_COLUMN.
 */
export const FILTER_SOURCE_ID = WORKSHEET_ID;
export const SEGMENT_COLUMN = 'Rep Segment';
export const REP_COLUMN = 'Rep Name';
export const CADENCE_NAME_COLUMN = 'Cadence Name';
export const DATE_COLUMN = 'Cadence Create Date';

/**
 * Hide the native runtime-filter pills / filter bar ThoughtSpot renders on the
 * liveboard header — we drive filters from the host UI instead. Injected into
 * the liveboard iframe via rules_UNSTABLE. Class names are version-fragile;
 * verify/adjust via right-click → Inspect if a release renames them.
 *   Docs: https://developers.thoughtspot.com/docs/css-rules
 */
const PILL_HIDE = { display: 'none !important' };
export const HIDE_FILTER_PILL_RULES: Record<string, Record<string, string>> = {
  '[class*="filterChip" i]': PILL_HIDE,
  '[class*="filter-chip" i]': PILL_HIDE,
  '[class*="appliedFilter" i]': PILL_HIDE,
  '[class*="applied-filter" i]': PILL_HIDE,
  '[class*="pinboardFilter" i]': PILL_HIDE,
  '[class*="pinboard-filter" i]': PILL_HIDE,
  '[class*="filterBar" i]': PILL_HIDE,
  '[class*="filter-bar" i]': PILL_HIDE,
  '[data-testid*="filter-chip" i]': PILL_HIDE,
  '[data-testid*="pinboard-filters" i]': PILL_HIDE,
};

