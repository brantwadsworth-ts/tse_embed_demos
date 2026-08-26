"use client";

interface DphHsLandingProps {
  onLogin: () => void;
}

export default function DphHsLanding({ onLogin }: DphHsLandingProps) {
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Utility bar ── */}
      <div style={{ background: "#112F60", color: "#fff", fontSize: "12px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "6px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {/* Facebook */}
            <a href="https://www.facebook.com/MTDPHHS" target="_blank" rel="noreferrer" style={{ color: "#fff", display: "flex", padding: "4px 6px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </a>
            {/* X */}
            <a href="https://x.com/DPHHSMT" target="_blank" rel="noreferrer" style={{ color: "#fff", display: "flex", padding: "4px 6px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/user/MontanaDPHHS" target="_blank" rel="noreferrer" style={{ color: "#fff", display: "flex", padding: "4px 6px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="text" placeholder="SEARCH" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "3px 10px", fontSize: 11, borderRadius: 2, outline: "none", width: 140 }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <button onClick={onLogin}
              style={{ background: "#fff", color: "#112F60", border: "none", padding: "4px 14px", borderRadius: 3, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              LOGIN →
            </button>
          </div>
        </div>
      </div>

      {/* ── Brand row ── */}
      <div style={{ background: "#112F60", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg" alt="Montana DPHHS" style={{ width: 72, height: 72 }} />
          <div style={{ color: "#fff", lineHeight: 1.2 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.85 }}>DEPARTMENT OF</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.04em" }}>PUBLIC HEALTH &amp;</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.04em" }}>HUMAN SERVICES</div>
          </div>
        </div>
      </div>

      {/* ── Main nav ── */}
      <nav style={{ background: "#112F60", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 0 }}>
            {["ABOUT", "CONTACT", "NEWS", "MEETINGS + EVENTS", "PUBLIC INFORMATION REQUESTS", "LEGISLATIVE PRESENTATIONS"].map((label) => (
              <a key={label} href="https://dphhs.mt.gov" target="_blank" rel="noreferrer"
                style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, letterSpacing: "0.08em", padding: "10px 12px", textDecoration: "none", whiteSpace: "nowrap" }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ position: "relative", background: "linear-gradient(135deg, #0d2247 0%, #1a4a7a 50%, #2563a8 100%)", color: "#fff", padding: "64px 24px", overflow: "hidden" }}>
        {/* Mountain silhouette SVG */}
        <svg viewBox="0 0 1440 200" style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", opacity: 0.15 }} preserveAspectRatio="none">
          <path d="M0,200 L0,120 L120,60 L240,100 L360,40 L480,80 L600,20 L720,70 L840,10 L960,60 L1080,30 L1200,80 L1320,50 L1440,90 L1440,200 Z" fill="#fff"/>
        </svg>
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.15em", opacity: 0.7, marginBottom: 12 }}>MIDIS DATA PORTAL</div>
          <h1 style={{ fontSize: 38, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.2, maxWidth: 600 }}>
            Montana Disease<br />Surveillance Data
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 520, lineHeight: 1.6, margin: "0 0 32px" }}>
            Access the MIDIS Reconciliation Portal for disease surveillance data quality metrics, case reconciliation, and Annual Case Review reporting.
          </p>
          <button onClick={onLogin}
            style={{ background: "#fff", color: "#112F60", border: "none", padding: "14px 32px", borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em" }}>
            Access Data Dashboard →
          </button>
        </div>
      </div>

      {/* ── Service cards ── */}
      <div style={{ background: "#f4f6f9", flex: 1, padding: "48px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#112F60", margin: "0 0 8px", letterSpacing: "0.02em" }}>PROGRAMS &amp; SERVICES</h2>
          <div style={{ width: 48, height: 3, background: "#3A71B0", marginBottom: 32 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { title: "Behavioral Health", icon: "🧠", desc: "Mental health and substance use disorder services across Montana." },
              { title: "Public Health", icon: "🏥", desc: "Disease prevention, immunizations, and community health programs." },
              { title: "Senior & Long-Term Care", icon: "🤝", desc: "Services supporting older Montanans and individuals with disabilities." },
              { title: "Child & Family Services", icon: "👨‍👩‍👧", desc: "Child welfare, foster care, and family support programs." },
              { title: "Medicaid", icon: "💊", desc: "Health coverage for eligible Montana residents." },
              { title: "Epidemiology", icon: "📊", desc: "Disease surveillance, outbreak response, and data analytics.", onClick: onLogin },
            ].map((card) => (
              <div key={card.title}
                onClick={card.onClick}
                style={{ background: "#fff", borderRadius: 6, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderTop: "3px solid #3A71B0", cursor: card.onClick ? "pointer" : "default", transition: "box-shadow 0.15s" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#112F60", letterSpacing: "0.04em", marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{card.desc}</div>
                {card.onClick && <div style={{ fontSize: 12, color: "#3A71B0", fontWeight: 600, marginTop: 12 }}>View Dashboard →</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#112F60", color: "#fff" }}>
        {/* Top band */}
        <div style={{ background: "#0d2247", display: "flex", justifyContent: "center", padding: "20px 24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg" alt="Montana DPHHS" style={{ width: 64, height: 64 }} />
        </div>
        {/* Main footer */}
        <div style={{ background: "#3A71B0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 40, alignItems: "start" }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://dphhs.mt.gov/_images/logo/DPHHS-logo-white-horizontal.svg" alt="" style={{ height: 36, marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 8 }}>
                {["FB","X","YT"].map(s => <div key={s} style={{ width: 28, height: 28, background: "rgba(255,255,255,0.2)", borderRadius: "50%" }} />)}
              </div>
            </div>
            <nav style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 32px" }}>
              {["CONTACT US","NEWS","MEETINGS + EVENTS","LEGAL RESOURCES","LANGUAGE ASSISTANCE","NONDISCRIMINATION","PROTECTED HEALTH","CAREERS"].map(l => (
                <a key={l} href="https://dphhs.mt.gov" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, letterSpacing: "0.06em", textDecoration: "none" }}>{l}</a>
              ))}
            </nav>
            <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.85 }}>
              <div>Department of Public Health and Human Services</div>
              <div>Director&apos;s Office</div>
              <div>111 North Sanders St. Helena, MT 59601</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>406-444-5623</div>
              <div>Montana Relay 711</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", padding: "12px 24px", display: "flex", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
            {["Privacy & Security","Accessibility","mt.gov"].map(l => (
              <a key={l} href="https://dphhs.mt.gov" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
