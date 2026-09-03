import { init, AuthType } from '@thoughtspot/visual-embed-sdk';
import {
  THOUGHTSPOT_HOST,
  TS_CSS_VARIABLES,
  TS_STRINGS,
  TS_STRING_IDS,
  TS_FONT_URL,
  LIVEBOARD_TABLE_RULES,
} from '../config';

let isInitialized = false;

export function initThoughtSpot(username: string, password: string) {
  if (isInitialized) return;
  init({
    thoughtSpotHost: THOUGHTSPOT_HOST,
    authType: AuthType.TrustedAuthTokenCookieless,
    username,
    getAuthToken: async () => {
      const res = await fetch('/api/auth-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Failed to get auth token');
      const data = await res.json();
      return data.token;
    },
    customizations: {
      style: {
        customCSSUrl: TS_FONT_URL,
        customCSS: { variables: TS_CSS_VARIABLES },
      },
      content: {
        strings: TS_STRINGS,
        stringIDs: TS_STRING_IDS,
      },
    },
  });
  isInitialized = true;
}

export function tsCustomizations(
  extraRules?: Record<string, Record<string, string>>,
) {
  const hasRules = extraRules && Object.keys(extraRules).length > 0;
  return {
    style: {
      customCSSUrl: TS_FONT_URL,
      customCSS: {
        variables: TS_CSS_VARIABLES,
        ...(hasRules ? { rules_UNSTABLE: extraRules } : {}),
      },
    },
    content: {
      strings: TS_STRINGS,
      stringIDs: TS_STRING_IDS,
    },
  };
}

export function liveboardCustomizations() {
  return tsCustomizations(LIVEBOARD_TABLE_RULES);
}

export async function ensureRestSession(_username: string, _password: string) {
  // No-op: trusted auth handles session via token
}
