import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, faqJsonLd, webPageJsonLd } from "@/lib/seo";

const teal = "#007A85";
const ink = "#071416";

export type GuidePoint = { title: string; body: string };

const wrap: React.CSSProperties = {
  background: `radial-gradient(900px 420px at 80% -10%, rgba(0,122,133,0.35), transparent 55%), linear-gradient(180deg, #042226 0%, ${ink} 42%, #050505 100%)`,
  color: "#ffffff",
  minHeight: "100dvh",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

const inner: React.CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
  padding: "28px 20px 88px",
};

const p: React.CSSProperties = {
  color: "#d7e4e6",
  fontSize: 16,
  lineHeight: 1.7,
  margin: "0 0 16px",
};

const h2: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.03em",
  margin: "8px 0 16px",
};

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 18,
  padding: "18px 18px 16px",
};

const cta: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: teal,
  color: "#fff",
  fontWeight: 800,
  textDecoration: "none",
  padding: "14px 22px",
  borderRadius: 999,
  marginRight: 10,
  marginTop: 8,
};

export function PublicGuide({
  badge,
  title,
  path,
  description,
  lede,
  children,
  faqs,
  points,
  steps,
  ctaHref = "/learn",
  ctaLabel = "Start free",
}: {
  badge: string;
  title: string;
  path: string;
  description: string;
  lede: string;
  children?: React.ReactNode;
  faqs: { q: string; a: string }[];
  points?: GuidePoint[];
  steps?: string[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <main style={wrap}>
      <JsonLd data={webPageJsonLd({ path, title, description })} />
      <JsonLd data={faqJsonLd(faqs)} />
      <div style={inner}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <Link href="/about" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#fff", fontWeight: 800 }}>
            <img src="/notho-icon-192.png" alt="" width={36} height={36} style={{ borderRadius: 10 }} />
            {SITE_NAME}
          </Link>
          <Link href={ctaHref} style={{ ...cta, margin: 0, padding: "10px 16px", fontSize: 14 }}>
            {ctaLabel}
          </Link>
        </header>

        <section style={{ display: "grid", gap: 28, alignItems: "center", gridTemplateColumns: "minmax(0, 1.2fr) minmax(240px, 0.8fr)" }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(0,122,133,0.22)", color: "#9fe7ee", fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 999, marginBottom: 14 }}>
              {badge} · South Africa
            </div>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em", margin: "0 0 14px" }}>
              {title}
            </h1>
            <p style={{ ...p, fontSize: 18, maxWidth: 560 }}>{lede}</p>
            <div>
              <Link href={ctaHref} style={cta}>{ctaLabel}</Link>
              <Link href="/about" style={{ ...cta, background: "transparent", border: "1px solid rgba(255,255,255,0.28)" }}>
                See the app
              </Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
              {["Free to start", "Built in rand", "Not a bank", "Not advice"].map((chip) => (
                <span key={chip} style={{ fontSize: 13, fontWeight: 700, color: "#d7e4e6", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, padding: "6px 12px" }}>
                  {chip}
              </span>
              ))}
            </div>
          </div>
          <aside style={{ background: "#fff", color: ink, borderRadius: 28, padding: 22, boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: teal }}>Today in Notho</p>
            <p style={{ margin: "10px 0 4px", fontSize: 42, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>5 min</p>
            <p style={{ margin: "0 0 16px", color: "#35575b" }}>A lesson you can finish before the kettle boils.</p>
            {["Learn the idea", "Review it tomorrow", "Try it on your numbers"].map((line, i) => (
              <div key={line} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderTop: "1px solid #e6eeee" }}>
                <span style={{ width: 28, height: 28, borderRadius: 999, background: teal, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{i + 1}</span>
                <span style={{ fontWeight: 700 }}>{line}</span>
              </div>
            ))}
          </aside>
        </section>

        {points && points.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 style={h2}>Why people stay</h2>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {points.map((point) => (
                <article key={point.title} style={card}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{point.title}</h3>
                  <p style={{ ...p, margin: 0 }}>{point.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {steps && steps.length > 0 && (
          <section style={{ marginTop: 36 }}>
            <h2 style={h2}>How it works</h2>
            <ol style={{ display: "grid", gap: 10, padding: 0, margin: 0, listStyle: "none" }}>
              {steps.map((step, i) => (
                <li key={step} style={{ ...card, display: "flex", gap: 14, alignItems: "center" }}>
                  <span style={{ color: teal, fontWeight: 800, fontSize: 22 }}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {children && <section style={{ marginTop: 28 }}>{children}</section>}

        <section style={{ marginTop: 40 }}>
          <h2 style={h2}>Questions, answered</h2>
          {faqs.map((item) => (
            <div key={item.q} style={{ ...card, marginBottom: 10 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{item.q}</h3>
              <p style={{ ...p, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 36, background: teal, borderRadius: 28, padding: "28px 24px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Start with one lesson.</p>
            <p style={{ margin: "6px 0 0", color: "#e7f7f8" }}>Free. In rand. No bank login.</p>
          </div>
          <Link href={ctaHref} style={{ ...cta, background: "#fff", color: teal, margin: 0 }}>{ctaLabel}</Link>
        </section>

        <footer style={{ marginTop: 28, color: "#8aa3a6", fontSize: 13, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span>Notho · Durban</span>
          <Link href="/privacy" style={{ color: "#8aa3a6" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "#8aa3a6" }}>Terms</Link>
          <a href="mailto:hello@notho.co.za" style={{ color: "#8aa3a6" }}>hello@notho.co.za</a>
          <span>Education only. Not an FSP.</span>
        </footer>
      </div>
    </main>
  );
}

export const guideStyles = { p, h2, card, teal };
