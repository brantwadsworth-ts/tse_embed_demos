"use client";

interface DemoUser {
  label: string;
  tsUsername: string;
}

interface RolePickerProps {
  demoUsers: DemoUser[];
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  onSelect: (username: string) => void;
}

export default function RolePicker({
  demoUsers,
  companyName,
  logoUrl,
  primaryColor,
  onSelect,
}: RolePickerProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "540px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={companyName}
              style={{
                width: "56px",
                height: "56px",
                objectFit: "contain",
                marginBottom: "16px",
              }}
            />
          )}
          <p
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#212529",
              margin: "0 0 6px",
            }}
          >
            {companyName}
          </p>
          <p style={{ fontSize: "14px", color: "#6c757d", margin: 0 }}>
            Select your role to continue
          </p>
        </div>

        {/* Role cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: demoUsers.length > 1 ? "1fr 1fr" : "1fr",
            gap: "12px",
          }}
        >
          {demoUsers.map((user) => (
            <button
              key={user.tsUsername}
              type="button"
              onClick={() => onSelect(user.tsUsername)}
              style={{
                border: `2px solid #e9ecef`,
                borderRadius: "12px",
                background: "#f8f9fa",
                padding: "20px 16px",
                cursor: "pointer",
                textAlign: "center",
                transition: "border-color 0.15s, background 0.15s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = primaryColor;
                el.style.background = "#fff";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#e9ecef";
                el.style.background = "#f8f9fa";
                el.style.transform = "translateY(0)";
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#212529",
                  margin: "0 0 4px",
                }}
              >
                {user.label}
              </p>
              <p style={{ fontSize: "12px", color: "#6c757d", margin: 0 }}>
                Sign in as this user
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
