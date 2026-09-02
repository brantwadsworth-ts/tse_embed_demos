import { init, AuthType } from '@thoughtspot/visual-embed-sdk';
import {
  THOUGHTSPOT_HOST,
  TS_CSS_VARIABLES,
  TS_STRINGS,
  TS_STRING_IDS,
  TS_FONT_URL,
} from '../config';

let isInitialized = false;

export function initThoughtSpot(username: string, password: string) {
  if (isInitialized) return;
  init({
    thoughtSpotHost: THOUGHTSPOT_HOST,
    authType: AuthType.Basic,
    username,
    password,
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
  return tsCustomizations();
}

let sessionReady = false;

export async function ensureRestSession(username: string, password: string) {
  if (sessionReady) return;
  try {
    await fetch(`${THOUGHTSPOT_HOST}/api/rest/2.0/auth/session/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password, remember_me: true }),
    });
    sessionReady = true;
  } catch {
    // SDK session may already be valid
  }
}
