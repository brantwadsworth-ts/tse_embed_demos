export default function DphHsHeader() {
  return (
    <header className="dphhs-header">
      {/* Row 1 — dark navy utility bar */}
      <div className="dphhs-utility-bar">
        <div className="dphhs-utility-inner">
          <nav className="dphhs-social-links" aria-label="Social media">
            <a href="https://www.youtube.com/user/MontanaDPHHS" aria-label="YouTube" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" className="dphhs-social-icon"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
            </a>
            <a href="https://x.com/DPHHSMT" aria-label="Twitter / X" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" className="dphhs-social-icon"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.facebook.com/MTDPHHS" aria-label="Facebook" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" className="dphhs-social-icon"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </a>
          </nav>
          <div className="dphhs-search-wrap">
            <input type="text" placeholder="SEARCH" className="dphhs-search-input" aria-label="Search" />
            <button className="dphhs-search-btn" aria-label="Submit search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="dphhs-search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 — logo / agency name */}
      <div className="dphhs-brand-row">
        <div className="dphhs-brand-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg"
            alt="Montana DPHHS"
            className="dphhs-circle-logo"
          />
          <div className="dphhs-agency-name">
            <span className="dphhs-dept-of">DEPARTMENT OF</span>
            <span className="dphhs-dept-main">PUBLIC HEALTH &amp;</span>
            <span className="dphhs-dept-main">HUMAN SERVICES</span>
          </div>
        </div>
      </div>

      {/* Row 3 — main navigation */}
      <nav className="dphhs-main-nav" aria-label="Main navigation">
        <div className="dphhs-main-nav-inner">
          <div className="dphhs-top-links">
            <a href="https://dphhs.mt.gov/aboutus" target="_blank" rel="noreferrer">ABOUT</a>
            <a href="https://dphhs.mt.gov/contactus" target="_blank" rel="noreferrer">CONTACT</a>
            <a href="https://dphhs.mt.gov/news" target="_blank" rel="noreferrer">NEWS</a>
            <a href="https://dphhs.mt.gov/meetingsevents" target="_blank" rel="noreferrer">MEETINGS + EVENTS</a>
            <a href="https://dphhs.mt.gov/publicinformationrequests" target="_blank" rel="noreferrer">PUBLIC INFORMATION REQUESTS</a>
            <a href="https://dphhs.mt.gov/legislativepresentations" target="_blank" rel="noreferrer">LEGISLATIVE PRESENTATIONS</a>
          </div>
          <div className="dphhs-sub-links">
            <a href="https://dphhs.mt.gov/requiredreports" target="_blank" rel="noreferrer">REQUIRED REPORTS ▾</a>
            <a href="#" className="dphhs-sub-active">DATA DASHBOARDS ▾</a>
            <a href="https://dphhs.mt.gov/apply" target="_blank" rel="noreferrer">APPLY/REPORT/REQUEST ▾</a>
            <a href="https://dphhs.mt.gov/azindex" target="_blank" rel="noreferrer">A-Z INDEX</a>
          </div>
        </div>
      </nav>
    </header>
  );
}
