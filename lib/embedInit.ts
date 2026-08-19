import { AuthType, init } from "@thoughtspot/visual-embed-sdk";

const TS_HOST = process.env.NEXT_PUBLIC_TS_HOST ?? "";

// Side-effecting module: import this (for its side effect only, e.g.
// `import "@/lib/embedInit";`) from the top of every embed view component
// -- LiveboardEmbedView.tsx, SpotterEmbedView.tsx.
//
// init() must run once, before any embed component mounts, and configures
// the SDK globally for every embed on the page. Calling it at module load
// time (rather than inside a React effect) guarantees that ordering --
// an embed's own mount effect can fire BEFORE a parent's useInit effect
// (React fires child effects first), which would otherwise throw "Error
// parsing ThoughtSpot host." On the server (SSR) this is a no-op: the SDK
// checks for `window` and returns early.
//
// Safe to import from multiple embed view files -- ES module caching means
// this side effect still only runs once per page load, not once per
// importer, so LiveboardEmbedView and SpotterEmbedView both importing it
// doesn't double-initialize the SDK.
init({
  thoughtSpotHost: TS_HOST,
  authType: AuthType.TrustedAuthTokenCookieless,
  getAuthToken: async () => {
    const response = await fetch("/api/token/custom", { method: "POST" });
    if (!response.ok) {
      throw new Error("Failed to fetch ThoughtSpot auth token.");
    }
    const data = await response.json();
    return data.token as string;
  },
});
