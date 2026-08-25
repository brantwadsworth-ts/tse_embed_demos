"use client";

import { LiveboardEmbed } from "@thoughtspot/visual-embed-sdk/react";

interface DemoEmbedProps {
  liveboardId: string;
}

export default function DemoEmbed({ liveboardId }: DemoEmbedProps) {
  return (
    <div style={{ height: "calc(100vh - 160px)", width: "100%" }}>
      <LiveboardEmbed
        liveboardId={liveboardId}
        fullHeight
        frameParams={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
