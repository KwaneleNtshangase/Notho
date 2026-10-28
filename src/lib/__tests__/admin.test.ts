import { describe, it, expect, afterEach } from "vitest";
import { OWNER_ADMIN_EMAIL, getAdminEmails, isAdminEmail } from "../admin";

const ORIGINAL = process.env.ADMIN_EMAILS;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = ORIGINAL;
});

describe("admin emails", () => {
  it("always includes the owner mailbox", () => {
    delete process.env.ADMIN_EMAILS;
    expect(OWNER_ADMIN_EMAIL).toBe("kwanelebc031@gmail.com");
    expect(getAdminEmails()).toContain("kwanelebc031@gmail.com");
    expect(isAdminEmail("kwanelebc031@gmail.com")).toBe(true);
    expect(isAdminEmail("KWANELEBC031@GMAIL.COM")).toBe(true);
  });

  it("merges ADMIN_EMAILS without dropping the owner", () => {
    process.env.ADMIN_EMAILS = "ops@notho.co.za, hello@notho.co.za";
    const list = getAdminEmails();
    expect(list).toContain("ops@notho.co.za");
    expect(list).toContain("hello@notho.co.za");
    expect(list).toContain("kwanelebc031@gmail.com");
  });

  it("rejects unknown and empty addresses", () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
    expect(isAdminEmail("learner@example.com")).toBe(false);
  });
});
