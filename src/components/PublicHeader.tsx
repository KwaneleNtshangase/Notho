import Link from "next/link";
import { OpenNothoButton } from "@/components/OpenNothoButton";

const teal = "#007A85";
const bar = "#0d0d0d";
const text = "#f2f2f2";

export function PublicHeader() {
  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: bar,
          borderBottom: "1px solid #222",
          padding: "14px 24px",
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
            <img src="/notho-logo-on-dark.png" alt="Notho" style={{ height: 52, width: "auto" }} />
          </Link>
          <nav style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 15, flexWrap: "wrap" }}>
            <Link href="/about" style={{ color: text, textDecoration: "none" }}>About</Link>
            <Link href="/financial-literacy" style={{ color: text, textDecoration: "none" }}>Learn</Link>
            <Link href="/investment-calculator" style={{ color: text, textDecoration: "none" }}>Calculate</Link>
            <Link href="/budgeting" style={{ color: text, textDecoration: "none" }}>Budget</Link>
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
      <div style={{ height: 80 }} />
    </>
  );
}
