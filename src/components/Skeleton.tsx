"use client";

import React from "react";

/** Thin wrapper around the global .skeleton shimmer (respects reduced-motion). */
export function Skeleton({
  width,
  height,
  radius = 10,
  style,
  className = "",
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

/** A short list of transaction-shaped skeleton rows. */
export function TransactionListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading transactions">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <Skeleton width={36} height={36} radius={10} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton height={14} width="70%" />
            <Skeleton height={11} width="40%" />
          </div>
          <Skeleton width={64} height={14} />
        </div>
      ))}
    </div>
  );
}

/** Course-card shaped skeleton matching the Learn grid. */
export function CourseCardSkeleton() {
  return (
    <div
      className="skeleton"
      aria-hidden
      style={{
        borderRadius: 14,
        padding: 14,
        height: 92,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <Skeleton height={16} width="60%" />
      <Skeleton height={8} width="90%" />
      <Skeleton height={6} width="40%" />
    </div>
  );
}
