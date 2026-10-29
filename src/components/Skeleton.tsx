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

/**
 * Matches the real course card: horizontal row with icon, title + note,
 * and a percentage / pin cluster on the right. Same radius and padding
 * as .course-card so the grid does not jump when content arrives.
 */
export function CourseCardSkeleton() {
  return (
    <div
      className="course-card"
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 14,
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-border)",
      }}
    >
      <Skeleton width={36} height={36} radius={10} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <Skeleton height={16} width="62%" radius={6} />
        <Skeleton height={11} width="38%" radius={4} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <Skeleton width={28} height={14} radius={4} />
        <Skeleton width={30} height={30} radius={999} />
      </div>
    </div>
  );
}

/**
 * Matches a Budget transaction row: 36px circle, two text lines, amount on the right.
 * Same padding and border as the real SwipeableRow.
 */
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
          <Skeleton width={36} height={36} radius={18} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <Skeleton height={13} width="55%" radius={4} />
            <Skeleton height={11} width="78%" radius={4} />
            <Skeleton height={10} width="32%" radius={4} />
          </div>
          <Skeleton width={68} height={14} radius={4} />
        </div>
      ))}
    </div>
  );
}
