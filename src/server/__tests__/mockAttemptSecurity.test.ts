import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { rateLimitAuditRequestId } from "@/server/mockAttemptSecurity";

describe("mock-attempt security helpers", () => {
  it("deduplicates rate-limit audit events within one account/action window", () => {
    const first = rateLimitAuditRequestId(
      "00000000-0000-4000-8000-000000000001",
      "attempt_read",
      42
    );

    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(
      rateLimitAuditRequestId(
        "00000000-0000-4000-8000-000000000001",
        "attempt_read",
        42
      )
    ).toBe(first);
    expect(
      rateLimitAuditRequestId(
        "00000000-0000-4000-8000-000000000001",
        "attempt_read",
        43
      )
    ).not.toBe(first);
    expect(
      rateLimitAuditRequestId(
        "00000000-0000-4000-8000-000000000001",
        "attempt_mutate",
        42
      )
    ).not.toBe(first);
  });
});
