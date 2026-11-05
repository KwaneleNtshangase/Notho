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
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px 24px",
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
        }}
      >
        {[
          { href: "https://youtube.com/@nothoapp", label: "YouTube", path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.8 15.5v-7l6.2 3.5-6.2 3.5z" },
          { href: "https://www.instagram.com/notho.app", label: "Instagram", path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1 .1-1.6.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.2.9-.3 1.9-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.9.2 1.9.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.2-.9.3-1.9.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.3-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.9-.2-1.9-.3-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm6.4-2.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z" },
          { href: "https://www.tiktok.com/@notho.app", label: "TikTok", path: "M19.6 6.3a6.5 6.5 0 0 1-3.8-1.2v8.4a5.5 5.5 0 1 1-4.7-5.4v2.7a2.8 2.8 0 1 0 1.9 2.7V2h2.8a6.5 6.5 0 0 0 3.8 3.3v1z" },
          { href: "https://www.facebook.com/share/1MPnpmmwgk/", label: "Facebook", path: "M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1z" },
          { href: "https://www.threads.com/@notho.app", label: "Threads", path: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm3.2 11.2c-.3 2.4-1.8 3.9-4.1 4.1-1.5.1-2.9-.3-3.9-1.2l1.2-1.3c.7.6 1.6.9 2.6.8 1.4-.1 2.3-1 2.5-2.4-.4.2-.9.3-1.4.3-2.2 0-3.7-1.6-3.7-3.6 0-2.1 1.5-3.6 3.6-3.6 1.1 0 2 .4 2.6 1.1.5-.3 1.1-.5 1.7-.5h.6l-.4 1.5h-.5c-.4 0-.7.1-1 .3.2.5.3 1 .3 1.5 0 .2 0 .4-.1.6 1.1.1 1.9.6 2.1 1.4z" },
          { href: "https://www.linkedin.com/company/notho-za", label: "LinkedIn", path: "M6.5 9H3.7v11.5h2.8V9zM5.1 3.5A1.6 1.6 0 1 0 5.1 6.7 1.6 1.6 0 0 0 5.1 3.5zM20.3 13.3c0-3.1-1.7-4.6-3.9-4.6-1.8 0-2.6 1-3.1 1.7V9H10.5c0 1.5 0 11.5 0 11.5h2.8v-6.4c0-.3 0-.7.1-1 .3-.7.9-1.4 2-1.4 1.4 0 2 1.1 2 2.6v6.2H20.3v-6.2z" },
        ].map((s) => (
          <a key={s.label} href={s.href} aria-label={s.label} title={s.label} target="_blank" rel="noreferrer" style={{ color: "#888", display: "inline-flex" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={s.path} />
            </svg>
          </a>
        ))}
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
