"use client";

import { SpotterEmbed } from "@thoughtspot/visual-embed-sdk/react";
import type { CustomisationsInterface } from "@thoughtspot/visual-embed-sdk";
// Side-effect import -- runs init() once. Safe alongside LiveboardEmbedView's
// own import of the same module (ES module caching de-dupes it).
import "@/lib/embedInit";
import {
  BRAND_CHAT_CONFIG,
  BRAND_CONTENT_CUSTOMIZATIONS,
  ICON_SPRITE_URL,
} from "@/lib/embedBranding";

const WORKSHEET_ID = process.env.NEXT_PUBLIC_SPOTTER_WORKSHEET_ID ?? "";

// DoorDash-branded Spotter theme. Colors match the app shell's palette in
// globals.css. To discover more --ts-var-* variables: ThoughtSpot
// Develop -> Customizations -> Theme Builder has a visual editor and an AI
// mode (feed it a brand screenshot/PDF and it generates the values).
const DOORDASH_CUSTOMIZATIONS: CustomisationsInterface = {
  // Optional -- set NEXT_PUBLIC_ICON_SPRITE_URL in .env.local to swap in a
  // customer-hosted SVG sprite. Left undefined, ThoughtSpot's default icons
  // render as-is.
  iconSpriteUrl: ICON_SPRITE_URL,
  style: {
    customCSS: {
      variables: {
        "--ts-var-root-background": "#FFFFFF",
        "--ts-var-spotter-prompt-background": "#F7F7F7",
        "--ts-var-spotter-input-background": "#FFFFFF",
        "--ts-var-root-color": "#191919",
        "--ts-var-button--primary-background": "#EB1700",
        "--ts-var-button--primary-color": "#FFFFFF",
        "--ts-var-button--secondary-background": "#F7F7F7",
        "--ts-var-button--secondary-color": "#EB1700",
        "--ts-var-button--secondary--hover-background": "#E6E6E6",
        "--ts-var-viz-background": "#FFFFFF",
        "--ts-var-viz-border-radius": "12px",
        "--ts-var-viz-title-color": "#191919",
        "--ts-var-viz-description-color": "#767676",
        "--ts-var-nav-background": "#EB1700",
        "--ts-var-nav-color": "#FFFFFF",
      },
    },
  },
  // strings/stringIDs come from lib/embedBranding.ts -- editable via
  // NEXT_PUBLIC_BRAND_NAME / NEXT_PUBLIC_SPOTTER_PERSONA_NAME in .env.local,
  // no code change needed to rename for a different prospect.
  content: BRAND_CONTENT_CUSTOMIZATIONS,
};

export default function SpotterEmbedView() {
  if (!WORKSHEET_ID) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed border-dd-border bg-dd-gray-light p-8 text-center text-sm text-dd-gray">
        Set NEXT_PUBLIC_SPOTTER_WORKSHEET_ID in .env.local to embed Spotter.
      </div>
    );
  }

  return (
    <SpotterEmbed
      worksheetId={WORKSHEET_ID}
      className="h-full w-full"
      frameParams={{ height: "100%" }}
      updatedSpotterChatPrompt
      customizations={DOORDASH_CUSTOMIZATIONS}
      spotterChatConfig={BRAND_CHAT_CONFIG}
    />
  );
}
