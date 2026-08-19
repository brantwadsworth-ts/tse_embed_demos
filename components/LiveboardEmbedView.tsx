"use client";

import { useEffect, useRef, useState } from "react";
import { LiveboardEmbed, useEmbedRef } from "@thoughtspot/visual-embed-sdk/react";
import { HostEvent, RuntimeFilterOp } from "@thoughtspot/visual-embed-sdk";
// Side-effect import -- runs init() once. Safe alongside SpotterEmbedView's
// own import of the same module (ES module caching de-dupes it).
import "@/lib/embedInit";
import { BRAND_CONTENT_CUSTOMIZATIONS, ICON_SPRITE_URL } from "@/lib/embedBranding";

const TS_HOST = process.env.NEXT_PUBLIC_TS_HOST ?? "";
const LIVEBOARD_ID = process.env.NEXT_PUBLIC_LIVEBOARD_ID ?? "";

// Column name on the underlying liveboard/worksheet that the country filter
// dropdown maps to. Must match the column name used in lib/thoughtspot.ts.
const COUNTRY_COLUMN = "Country Name";

function buildRuntimeFilters(selectedCountry: string) {
  if (selectedCountry === "ALL") return [];
  return [
    {
      columnName: COUNTRY_COLUMN,
      operator: RuntimeFilterOp.EQ,
      values: [selectedCountry],
    },
  ];
}

interface LiveboardEmbedViewProps {
  selectedCountry: string;
}

export default function LiveboardEmbedView({
  selectedCountry,
}: LiveboardEmbedViewProps) {
  const embedRef = useEmbedRef<typeof LiveboardEmbed>();
  // Frozen at mount so the `runtimeFilters` prop never changes after the
  // embed is constructed -- the SDK deep-compares view config props and
  // fully reconstructs the embed (destroy + recreate) whenever one changes.
  // Later country changes go through HostEvent.UpdateRuntimeFilters instead,
  // which updates the already-mounted embed in place.
  const [initialFilters] = useState(() => buildRuntimeFilters(selectedCountry));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    embedRef.current?.trigger(
      HostEvent.UpdateRuntimeFilters,
      buildRuntimeFilters(selectedCountry),
    );
  }, [selectedCountry, embedRef]);

  if (!TS_HOST || !LIVEBOARD_ID) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed border-dd-border bg-dd-gray-light p-8 text-center text-sm text-dd-gray">
        Set NEXT_PUBLIC_TS_HOST and NEXT_PUBLIC_LIVEBOARD_ID in .env.local to
        embed the liveboard.
      </div>
    );
  }

  return (
    <LiveboardEmbed
      ref={embedRef}
      className="h-full w-full"
      liveboardId={LIVEBOARD_ID}
      runtimeFilters={initialFilters}
      frameParams={{ width: "100%", height: "100%" }}
      fullHeight
      isLiveboardMasterpiecesEnabled
      updatedSpotterChatPrompt
      // Applies the same brand-name / Spotter-persona-name string overrides
      // as SpotterEmbedView -- relevant here because updatedSpotterChatPrompt
      // lets users launch the Spotter chat panel directly from a viz, which
      // renders with this same persona text.
      customizations={{
        content: BRAND_CONTENT_CUSTOMIZATIONS,
        iconSpriteUrl: ICON_SPRITE_URL,
      }}
    />
  );
}
