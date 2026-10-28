"use client";

import { useEffect, useState } from "react";

type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{
    numPages: number;
    getPage: (n: number) => Promise<{
      getViewport: (o: { scale: number }) => { width: number; height: number };
      render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
    }>;
  }> };
};

function loadPdfJs(): Promise<PdfJs> {
  const w = window as Window & { pdfjsLib?: PdfJs };
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-notho-pdfjs]");
    if (existing) {
      existing.addEventListener("load", () => w.pdfjsLib ? resolve(w.pdfjsLib) : reject(new Error("pdfjs")));
      existing.addEventListener("error", () => reject(new Error("pdfjs")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.min.js";
    s.async = true;
    s.dataset.nothoPdfjs = "1";
    s.onload = () => {
      if (!w.pdfjsLib) {
        reject(new Error("pdfjs"));
        return;
      }
      w.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.js";
      resolve(w.pdfjsLib);
    };
    s.onerror = () => reject(new Error("pdfjs"));
    document.head.appendChild(s);
  });
}

type Props = { blob: Blob };

export function PdfBlobPages({ blob }: Props) {
  const [pages, setPages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("Opening report…");

  useEffect(() => {
    let cancelled = false;
    setPages([]);
    setError(null);
    setProgress("Opening report…");

    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const data = await blob.arrayBuffer();
        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;
        for (let i = 1; i <= doc.numPages; i++) {
          setProgress(`Drawing page ${i} of ${doc.numPages}`);
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1.45 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;
          const url = canvas.toDataURL("image/jpeg", 0.82);
          setPages((prev) => [...prev, url]);
        }
        setProgress("");
      } catch {
        if (!cancelled) setError("Could not draw the pages. Use Share or Save PDF.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [blob]);

  if (error) {
    return (
      <div style={{ padding: 28, textAlign: "center", color: "var(--color-text-secondary)", fontSize: 14 }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      {pages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Report page ${i + 1}`}
          style={{ width: "100%", height: "auto", borderRadius: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.12)" }}
        />
      ))}
      {progress ? (
        <div style={{ textAlign: "center", padding: 20, fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)" }}>
          {progress}
        </div>
      ) : null}
    </div>
  );
}
