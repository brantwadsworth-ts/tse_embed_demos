"use client";

import { LiveboardEmbed } from "@thoughtspot/visual-embed-sdk/react";

interface DemoEmbedProps {
  liveboardId: string;
}

export default function DemoEmbed({ liveboardId }: DemoEmbedProps) {
  return (
    <div style={{ width: "100%" }}>
      <LiveboardEmbed
        liveboardId={liveboardId}
        fullHeight
        frameParams={{ width: "100%" }}
      />
    </div>
  );
}
