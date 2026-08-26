"use client";

import { LiveboardEmbed } from "@thoughtspot/visual-embed-sdk/react";

interface DemoEmbedProps {
  liveboardId: string;
}

export default function DemoEmbed({ liveboardId }: DemoEmbedProps) {
  return (
    <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <LiveboardEmbed
        liveboardId={liveboardId}
        frameParams={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
