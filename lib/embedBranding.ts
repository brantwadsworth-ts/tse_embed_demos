// Prospect-specific naming, editable without a code change -- set these
// NEXT_PUBLIC_* vars in .env.local and rebuild to reuse this same app for a
// different prospect. Falls back to vanilla ThoughtSpot terms if left
// unset, so a forgotten env var never renders as a literal "undefined" in
// the UI.
export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "ThoughtSpot";
export const SPOTTER_PERSONA_NAME =
  process.env.NEXT_PUBLIC_SPOTTER_PERSONA_NAME || "Spotter";
export const SPOTTER_CARD_LABEL =
  process.env.NEXT_PUBLIC_SPOTTER_CARD_LABEL || BRAND_NAME;
// Unlike the naming vars above, this has no text fallback -- when unset,
// leave it `undefined` so the prop is effectively omitted and ThoughtSpot's
// default icon set renders, rather than pointing at a placeholder URL.
export const ICON_SPRITE_URL = process.env.NEXT_PUBLIC_ICON_SPRITE_URL || undefined;

// Shared `customizations.content` overrides. Apply the SAME object to both
// LiveboardEmbed and SpotterEmbed's `customizations` prop -- Liveboard
// needs this too because `updatedSpotterChatPrompt` lets users launch the
// Spotter chat panel directly from a viz, which renders with this same
// "Spotter" persona text.
export const BRAND_CONTENT_CUSTOMIZATIONS = {
  strings: {
    Spotter: SPOTTER_PERSONA_NAME,
    ThoughtSpot: BRAND_NAME,
  },
  stringIDs: {
    "spotter.newChatPrompt.landingPage.title": `Hi, I’m ${SPOTTER_PERSONA_NAME}.\nI can answer your data questions!`,
  },
};

// Spotter-specific chat/response-card branding config (separate prop from
// `customizations` -- see SpotterChatViewConfig).
export const BRAND_CHAT_CONFIG = {
  hideToolResponseCardBranding: true,
  toolResponseCardBrandingLabel: SPOTTER_CARD_LABEL,
  spotterFileUploadEnabled: true,
};
