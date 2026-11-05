import Link from "next/link";

const teal = "#007A85";

export function PublicFooter() {
  return (
    <footer
      style={{
        background: "#0d0d0d",
        color: "#d0d0d0",
        marginTop: 64,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "48px 24px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 32,
        }}
      >
        <div>
          <p style={{ color: "#888", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 12px" }}>
            LEARN
          </p>
          <Link href="/financial-literacy" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>
            Financial literacy
          </Link>
          <Link href="/personal-finance" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>
            Personal finance
          </Link>
          <Link href="/re5" style={{ display: "block", color: "#fff", textDecoration: "none", fontSize: 14 }}>
            RE5 prep
          </Link>
        </div>
        <div>
          <p style={{ color: "#888", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 12px" }}>
            TOOLS
          </p>
          <Link href="/investment-calculator" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>
            Investment calculator
          </Link>
          <Link href="/budgeting" style={{ display: "block", color: "#fff", textDecoration: "none", fontSize: 14 }}>
            Budgeting
          </Link>
        </div>
        <div>
          <p style={{ color: "#888", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 12px" }}>
            COMPANY
          </p>
          <Link href="/about" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>
            About
          </Link>
          <Link href="/support" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>
            Support
          </Link>
          <Link href="/privacy" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>
            Privacy
          </Link>
          <Link href="/terms" style={{ display: "block", color: "#fff", textDecoration: "none", fontSize: 14 }}>
            Terms
          </Link>
        </div>
        <div style={{ gridColumn: "span 1" }}>
          <img src="/notho-logo-on-dark.png" alt="Notho" style={{ height: 32, width: "auto", marginBottom: 12 }} />
          <p style={{ fontSize: 14, lineHeight: 1.55, color: "#b0b0b0", margin: 0 }}>
            Short lessons and tools for learning personal finance in South Africa.
          </p>
          <p style={{ fontSize: 13, color: "#888", marginTop: 12 }}>
            Founded by Kwanele Ntshangase.
          </p>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid #222",
          padding: "16px 24px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 12,
          maxWidth: 1080,
          margin: "0 auto",
          fontSize: 13,
          color: "#666",
        }}
      >
        <span>© {new Date().getFullYear()} Kwanele Ntshangase</span>
        <span>
          <Link href="/privacy" style={{ color: "#888", marginRight: 16 }}>Privacy</Link>
          <Link href="/terms" style={{ color: "#888", marginRight: 16 }}>Terms</Link>
          <Link href="/support" style={{ color: "#888" }}>Support</Link>
        </span>
      </div>
    </footer>
  );
}
