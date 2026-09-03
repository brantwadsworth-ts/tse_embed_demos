import { SearchEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { WORKSHEET_ID, TS_CSS_VARIABLES, TS_FONT_URL } from '../config';

const Search = SearchEmbed as unknown as (props: any) => JSX.Element;

export default function MyReports() {
  const customizations = {
    style: {
      customCSS: {
        variables: TS_CSS_VARIABLES,
      },
      customCSSUrl: TS_FONT_URL,
    },
  };

  return (
    <div className="tab-analytics">
      <div className="analytics-toolbar">
        <div className="analytics-toolbar-left">
          <div>
            <h1 className="page-title">My Reports</h1>
            <p className="page-subtitle">Build custom procurement reports and visualizations</p>
          </div>
        </div>
      </div>
      <div className="analytics-split">
        <div className="analytics-board-col search-embed-col">
          <div className="liveboard-wrapper">
            <Search
              dataSource={WORKSHEET_ID}
              frameParams={{ width: '100%' }}
              customizations={customizations}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
