export default function Footer() {
  return (
    <footer className="dphhs-footer">
      {/* Navy top band with circle logo */}
      <div className="dphhs-footer-top">
        <img
          src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg"
          alt="Montana DPHHS"
          className="dphhs-footer-circle-logo"
        />
      </div>

      {/* Medium-blue main footer band */}
      <div className="dphhs-footer-main">
        <div className="dphhs-footer-inner">
          {/* Left: white horizontal logo + social */}
          <div className="dphhs-footer-brand">
            <img
              src="https://dphhs.mt.gov/_images/logo/DPHHS-logo-white-horizontal.svg"
              alt="Department of Public Health and Human Services"
              className="dphhs-footer-horiz-logo"
            />
            <div className="dphhs-footer-social">
              <a href="https://www.facebook.com/MTDPHHS" aria-label="Facebook" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" className="dphhs-footer-social-icon"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              </a>
              <a href="https://x.com/DPHHSMT" aria-label="Twitter / X" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" className="dphhs-footer-social-icon"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.youtube.com/user/MontanaDPHHS" aria-label="YouTube" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" className="dphhs-footer-social-icon"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
              </a>
            </div>
          </div>

          {/* Center: nav links */}
          <nav className="dphhs-footer-nav" aria-label="Footer navigation">
            <a href="https://dphhs.mt.gov/contactus" target="_blank" rel="noreferrer">CONTACT US</a>
            <a href="https://dphhs.mt.gov/news" target="_blank" rel="noreferrer">NEWS</a>
            <a href="https://dphhs.mt.gov/meetingsevents" target="_blank" rel="noreferrer">MEETINGS + EVENTS</a>
            <a href="https://dphhs.mt.gov/legalresources" target="_blank" rel="noreferrer">LEGAL RESOURCES</a>
            <a href="https://dphhs.mt.gov/languageassistance" target="_blank" rel="noreferrer">LANGUAGE ASSISTANCE</a>
            <a href="https://dphhs.mt.gov/nondiscrimination" target="_blank" rel="noreferrer">NONDISCRIMINATION</a>
            <a href="https://dphhs.mt.gov/protectedhealth" target="_blank" rel="noreferrer">PROTECTED HEALTH</a>
            <a href="https://dphhs.mt.gov/careers" target="_blank" rel="noreferrer">CAREERS</a>
          </nav>

          {/* Right: address */}
          <div className="dphhs-footer-address">
            <p>Department of Public Health and Human Services</p>
            <p>Director's Office</p>
            <p>111 North Sanders St. Helena, MT 59601</p>
            <p className="dphhs-footer-phone">406-444-5623</p>
            <p>Montana Relay 711</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="dphhs-footer-bottom">
          <a href="https://dphhs.mt.gov/privacy" target="_blank" rel="noreferrer">Privacy &amp; Security</a>
          <a href="https://dphhs.mt.gov/accessibility" target="_blank" rel="noreferrer">Accessibility</a>
          <a href="https://mt.gov" target="_blank" rel="noreferrer">mt.gov</a>
        </div>
      </div>
    </footer>
  );
}
