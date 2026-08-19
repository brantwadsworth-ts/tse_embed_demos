const TS_HOST = process.env.TS_HOST;
const TS_SECRET_KEY = process.env.TS_SECRET_KEY;
const TS_ORG_IDENTIFIER = process.env.TS_ORG_IDENTIFIER;
const TS_TOKEN_VALIDITY_SEC = parseInt(process.env.TS_TOKEN_VALIDITY_SEC ?? "300", 10);
const TS_COUNTRY_WORKSHEET_ID = process.env.TS_COUNTRY_WORKSHEET_ID;

// Must match the actual column name on the worksheet referenced by
// TS_COUNTRY_WORKSHEET_ID, and the runtime filter column used when
// embedding the liveboard (see components/LiveboardEmbedView.tsx).
const COUNTRY_COLUMN = "Country Name";

export async function getAccessTokenForUser(username: string): Promise<string> {
  if (!TS_HOST || !TS_SECRET_KEY) {
    throw new Error("TS_HOST / TS_SECRET_KEY are not configured on the server.");
  }

  const response = await fetch(`${TS_HOST}/api/rest/2.0/auth/token/custom`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      username,
      secret_key: TS_SECRET_KEY,
      org_identifier: TS_ORG_IDENTIFIER,
      persist_option: "NONE",
      validity_time_in_sec: TS_TOKEN_VALIDITY_SEC,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to generate ThoughtSpot token: ${detail}`);
  }

  const data = await response.json();
  return data.token as string;
}

// Queries the worksheet directly, authenticated as the given user, so
// ThoughtSpot's RLS (the dd_Country formula variable) naturally scopes the
// result to exactly the countries that user is allowed to see.
export async function getUserCountryOptions(username: string): Promise<string[]> {
  if (!TS_HOST || !TS_COUNTRY_WORKSHEET_ID) return [];

  const token = await getAccessTokenForUser(username);

  const response = await fetch(`${TS_HOST}/api/rest/2.0/searchdata`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query_string: `[${COUNTRY_COLUMN}]`,
      logical_table_identifier: TS_COUNTRY_WORKSHEET_ID,
      record_size: 300,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to fetch country values: ${detail}`);
  }

  const data = await response.json();
  const content = data.contents?.[0];
  const rows: unknown[] = content?.data_rows ?? [];

  const values = rows
    .map((row) =>
      Array.isArray(row) ? row[0] : (row as Record<string, unknown>)[COUNTRY_COLUMN],
    )
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  return Array.from(new Set(values)).sort();
}

export interface ThoughtSpotGroup {
  id: string;
  name: string;
  displayName: string;
}

// Lists groups the acting user (an admin) can see, for the onboarding
// form's group picker.
export async function getGroups(actingUsername: string): Promise<ThoughtSpotGroup[]> {
  if (!TS_HOST) return [];

  const token = await getAccessTokenForUser(actingUsername);

  const response = await fetch(`${TS_HOST}/api/rest/2.0/groups/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ record_size: -1 }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to fetch groups: ${detail}`);
  }

  const data = await response.json();
  return (data as Array<{ id: string; name: string; display_name: string }>).map((group) => ({
    id: group.id,
    name: group.name,
    displayName: group.display_name,
  }));
}

// Whether `targetUsername` already exists in ThoughtSpot, checked using the
// acting admin's own token. Used purely to give the onboarding form
// accurate feedback -- creating vs. updating -- since auto_create silently
// skips updating display_name/email/groups for users that already exist.
export async function userExists(
  actingUsername: string,
  targetUsername: string,
): Promise<boolean> {
  if (!TS_HOST) return false;

  const token = await getAccessTokenForUser(actingUsername);

  const response = await fetch(`${TS_HOST}/api/rest/2.0/users/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ user_identifier: targetUsername, record_size: 1 }),
  });

  if (!response.ok) return false;
  const data = await response.json();
  return Array.isArray(data) && data.length > 0;
}

export interface OnboardUserParams {
  username: string;
  displayName: string;
  email: string;
  groupIdentifiers: string[];
  variableValues: Array<{ name: string; values: string[] }>;
}

// Creates (or updates the RLS variable values of, if already existing) a
// user in one call to /auth/token/custom -- auto_create handles just-in-time
// user provisioning + group assignment, and persist_option: "REPLACE" with
// variable_values persists the RLS formula-variable values onto the user's
// profile. The returned token itself is discarded; this call is used purely
// for its side effects.
export async function onboardUser({
  username,
  displayName,
  email,
  groupIdentifiers,
  variableValues,
}: OnboardUserParams): Promise<void> {
  if (!TS_HOST || !TS_SECRET_KEY) {
    throw new Error("TS_HOST / TS_SECRET_KEY are not configured on the server.");
  }

  const response = await fetch(`${TS_HOST}/api/rest/2.0/auth/token/custom`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      username,
      secret_key: TS_SECRET_KEY,
      org_identifier: TS_ORG_IDENTIFIER,
      persist_option: "REPLACE",
      auto_create: true,
      display_name: displayName,
      email,
      groups: groupIdentifiers.map((identifier) => ({ identifier })),
      variable_values: variableValues,
      validity_time_in_sec: TS_TOKEN_VALIDITY_SEC,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to onboard user: ${detail}`);
  }
}

export async function deleteThoughtSpotUser(
  actingUsername: string,
  targetUsername: string,
): Promise<void> {
  if (!TS_HOST) {
    throw new Error("TS_HOST is not configured on the server.");
  }

  const token = await getAccessTokenForUser(actingUsername);

  const response = await fetch(
    `${TS_HOST}/api/rest/2.0/users/${encodeURIComponent(targetUsername)}/delete`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to delete ThoughtSpot user: ${detail}`);
  }
}
