interface GenericHeaderProps {
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
}

export default function GenericHeader({
  companyName,
  logoUrl,
  primaryColor,
}: GenericHeaderProps) {
  return (
    <header
      style={{
        background: primaryColor,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "0 24px",
        height: "60px",
        color: "#ffffff",
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
          fontSize: "18px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: "#ffffff",
        }}
      >
        {companyName}
      </span>
    </header>
  );
}
