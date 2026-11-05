import Link from "next/link";
import { OpenNothoButton } from "@/components/OpenNothoButton";

const teal = "#007A85";
const ink = "#1a1a1a";

export function PublicHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid #eee",
        padding: "16px 24px",
        background: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Link href="/about">
          <img src="/notho-logo.png" alt="Notho" style={{ height: 40, width: "auto" }} />
        </Link>
        <nav style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 14, flexWrap: "wrap" }}>
          <Link href="/about" style={{ color: ink, textDecoration: "none" }}>About</Link>
          <Link href="/financial-literacy" style={{ color: ink, textDecoration: "none" }}>Learn</Link>
          <Link href="/investment-calculator" style={{ color: ink, textDecoration: "none" }}>Calculate</Link>
          <Link href="/budgeting" style={{ color: ink, textDecoration: "none" }}>Budget</Link>
          <OpenNothoButton
            style={{
              background: teal,
              color: "#fff",
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: 6,
              fontWeight: 700,
            }}
          />
        </nav>
      </div>
    </header>
  );
}
