import React from 'react';
import { SpotterEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { WORKSHEET_ID, SPOTTER_EMBED_FLAGS, TS_CSS_VARIABLES, TS_STRINGS, TS_STRING_IDS, TS_FONT_URL } from '../config';

const Spotter = SpotterEmbed as unknown as (props: any) => React.ReactElement;

export default function AskMerlin() {
  const customizations = {
    style: {
      customCSS: {
        variables: TS_CSS_VARIABLES,
      },
      customCSSUrl: TS_FONT_URL,
    },
    content: {
      strings: TS_STRINGS,
      stringIDs: TS_STRING_IDS,
    },
  };

  return (
    <div className="tab-ask">
      <div className="ask-header">
        <h1 className="page-title">Ask Merlin</h1>
        <p className="page-subtitle">AI-powered procurement insights — ask anything about your spend data</p>
      </div>
      <div className="ask-embed-wrapper">
        <Spotter
          worksheetId={WORKSHEET_ID}
          frameParams={{ width: '100%', height: '100%' }}
          customizations={customizations}
          {...SPOTTER_EMBED_FLAGS}
        />
      </div>
    </div>
  );
}
