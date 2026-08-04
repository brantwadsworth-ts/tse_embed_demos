// ---------------------------------------------------------------------------
// Central configuration for the Salesloft Analytics mockup.
// IDs + ThoughtSpot styling are sourced from salesloft_fin.json so that every
// embedded ThoughtSpot component shares the exact same look & feel.
// ---------------------------------------------------------------------------

/** ThoughtSpot cluster (from appConfig.thoughtspotUrl) */
export const THOUGHTSPOT_HOST = 'https://salesloft-clari.thoughtspot.cloud';

/** The Analytics liveboard embedded in Tab 2 (Analytics). */
export const ANALYTICS_LIVEBOARD_ID = '431cb7d1-7551-48ca-ab04-2261bb40a6e8';

/** Liveboard shown inline (per-cadence) on the Inline Insights tab. */
export const INLINE_INSIGHTS_LIVEBOARD_ID =
  'd57c9aeb-2c50-4afe-857a-327fad94c7cc';

/** Worksheet/model the Inline Insights tab queries for cadence names. */
export const CADENCE_WORKSHEET_ID = '06f92f41-00e5-4d81-8213-8a6616f83f49';

/** Saved Answer embedded on the Signals tab. */
export const SIGNALS_ANSWER_ID = 'cd7bd15c-a207-4bde-aef1-ed0a6e3dad06';

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

/**
 * Worksheet / model used everywhere Spotter runs — the "Salesloft AI" Spotter
 * modal (Analytics tab), the Ask Salesloft Spotter embed, and the host chatbot.
 */
export const WORKSHEET_ID = '06f92f41-00e5-4d81-8213-8a6616f83f49';

// ---------------------------------------------------------------------------
// ThoughtSpot embed styling — taken verbatim from
// salesloft_fin.json > stylingConfig.embeddedContent
// ---------------------------------------------------------------------------

/** CSS variables applied to every embedded ThoughtSpot surface. */
export const TS_CSS_VARIABLES: Record<string, string> = {
  '--ts-var-root-background': '#FDFEFE',
  '--ts-var-root-color': '#073B3A',
  '--ts-var-root-font-family': '"Inter", "Avenir Next", "Segoe UI", sans-serif',
  '--ts-var-application-color': '#0A4A4A',
  '--ts-var-nav-background': '#FFFFFF',
  '--ts-var-nav-color': '#0A4A4A',
  '--ts-var-search-data-button-background': '#0C6E6C',
  '--ts-var-search-data-button-font-color': '#FFFFFF',
  '--ts-var-search-bar-background': '#F6FAFA',
  '--ts-var-search-bar-text-font-color': '#0A4A4A',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  '--ts-var-button--primary-background': '#0C6E6C',
  '--ts-var-button--primary-color': '#FFFFFF',
  '--ts-var-button--primary--hover-background': '#0A5C5A',
  '--ts-var-button--primary--active-background': '#084B49',
  '--ts-var-button--secondary-background': '#E9F3F2',
  '--ts-var-button--secondary-color': '#0A4A4A',
  '--ts-var-button--secondary--hover-background': '#DDECEC',
  '--ts-var-button--secondary--active-background': '#CFE3E2',
  '--ts-var-viz-title-color': '#073B3A',
  '--ts-var-viz-title-font-family': '"Fraunces", "Iowan Old Style", "Georgia", serif',
  '--ts-var-viz-description-color': '#1D5A59',
  '--ts-var-viz-border-radius': '14px',
  '--ts-var-viz-box-shadow': '0 1px 2px rgba(7, 59, 58, 0.06), 0 8px 24px rgba(7, 59, 58, 0.08)',
  '--ts-var-viz-background': '#FFFFFF',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#E8F4F3',
  '--ts-var-chip-color': '#0A4A4A',
  '--ts-var-chip--hover-background': '#D9ECEA',
  '--ts-var-chip--hover-color': '#073B3A',
  '--ts-var-chip--active-background': '#0C6E6C',
  '--ts-var-chip--active-color': '#FFFFFF',
  '--ts-var-menu-background': '#FFFFFF',
  '--ts-var-menu-color': '#0A4A4A',
  '--ts-var-menu--hover-background': '#F1F7F7',
  '--ts-var-dialog-body-background': '#FFFFFF',
  '--ts-var-dialog-body-color': '#0A4A4A',
  '--ts-var-dialog-header-background': '#FFFFFF',
  '--ts-var-dialog-header-color': '#073B3A',
  '--ts-var-list-hover-background': '#F1F7F7',
  '--ts-var-list-selected-background': '#E4F0EF',
  '--ts-var-liveboard-layout-background': '#FDFEFE',
  '--ts-var-liveboard-header-background': '#FFFFFF',
  '--ts-var-liveboard-header-font-color': '#073B3A',
  '--ts-var-liveboard-tile-background': '#FFFFFF',
  '--ts-var-liveboard-tile-border-color': '#D7E7E6',
  '--ts-var-liveboard-tile-border-radius': '14px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#F4FAF9',
  '--ts-var-liveboard-tab-active-border-color': '#F26B5E',
  '--ts-var-liveboard-tab-hover-color': '#0C6E6C',
  '--ts-var-liveboard-header-action-button-background': '#E8F4F3',
  '--ts-var-liveboard-header-action-button-font-color': '#0A4A4A',
  '--ts-var-liveboard-header-action-button-hover-color': '#073B3A',
  '--ts-var-liveboard-header-action-button-active-color': '#073B3A',
  '--ts-var-parameter-chip-background': '#E8F4F3',
  '--ts-var-parameter-chip-text-color': '#0A4A4A',
  '--ts-var-parameter-chip-hover-background': '#D9ECEA',
  '--ts-var-parameter-chip-hover-text-color': '#073B3A',
  '--ts-var-parameter-chip-active-background': '#0C6E6C',
  '--ts-var-parameter-chip-active-text-color': '#FFFFFF',
  '--ts-var-axis-title-color': '#1D5A59',
  '--ts-var-axis-data-label-color': '#2C6A69',
  '--ts-var-kpi-hero-color': '#073B3A',
  '--ts-var-kpi-comparison-color': '#1D5A59',
  '--ts-var-kpi-positive-change-color': '#1E8E5A',
  '--ts-var-kpi-negative-change-color': '#C84B3A',
};

/**
 * Welcome message for the host-owned Salesloft AI chatbot
 * (from salesloft_fin.json > appConfig.chatbot.welcomeMessage, lightly adapted).
 */
export const CHATBOT_WELCOME =
  "Hi! I'm Salesloft AI. Ask me about Salesloft, or ask a question about your data — like “show meetings booked by week” or “top cadences by influenced pipeline.”";

/** Greeting + data model used when the chatbot is opened on the Cadences tab. */
export const CHATBOT_CADENCES_WELCOME =
  'What would you like to know about the cadences shown here?';

/** Spotter icon sprite (magician/spotter icon) from salesloft_fin.json. */
export const TS_ICON_SPRITE_URL =
  'https://cdn.jsdelivr.net/gh/thoughtspot/tse-demo-builders-pre-built/icons/spotter/generic-02.svg';

/**
 * String customizations — replace "Spotter" with "Salesloft AI" everywhere,
 * plus the landing-page description override (from
 * salesloft_fin.json > stylingConfig.embeddedContent.strings / stringIDs).
 */
export const TS_STRINGS: Record<string, string> = {
  Spotter: 'Salesloft AI',
};

export const TS_STRING_IDS: Record<string, string> = {
  'convAssist.landingpage.description2': 'Ask a question about sales.',
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
    spotterSidebarDefaultExpanded: true,
  },
};

// ---------------------------------------------------------------------------
// Host-side filters on the Analytics liveboard.
//   Hierarchy: OWNER_COLUMN → CADENCE_NAME_COLUMN. Date: DATE_COLUMN.
// Option lists are fetched from FILTER_SOURCE_ID via the searchdata REST API;
// selections are pushed to the liveboard as runtime filters. Column names must
// match the data source's column display names for the runtime filter to bind.
//   Runtime filters: https://developers.thoughtspot.com/docs/runtime-filters
// ---------------------------------------------------------------------------

/** Model queried for the filter option lists (same model the liveboard uses). */
export const FILTER_SOURCE_ID = WORKSHEET_ID;
export const OWNER_COLUMN = 'Cadence Owner';
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
