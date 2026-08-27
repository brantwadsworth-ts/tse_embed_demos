interface GenericHeaderProps {
  companyName: string;
  logoUrl?: string;
}

export default function GenericHeader({ companyName, logoUrl }: GenericHeaderProps) {
  return (
    <header
      style={{
        background: "var(--portal-header-bg)",
        borderBottom: "1px solid var(--portal-border)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "0 24px",
        height: "60px",
        flexShrink: 0,
      }}
    >
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={companyName}
          style={{ height: "36px", width: "auto", objectFit: "contain" }}
        />
      )}
      <span
        style={{
          fontSize: "17px",
          fontWeight: 700,
          letterSpacing: "0.01em",
          color: "var(--portal-header-text)",
        }}
      >
        {companyName}
      </span>
      <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--portal-text-muted)", letterSpacing: "0.04em" }}>
        Powered by ThoughtSpot
      </span>
    </header>
  );
}
