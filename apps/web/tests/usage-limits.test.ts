import { describe, expect, it } from "vitest";
import { FREE_PLAN_LIMITS, UsageLimitError } from "../modules/dashboard/server/usage-limits";

describe("usage limits", () => {
  it("contains no removed application-tracker credit type", () => {
    expect(FREE_PLAN_LIMITS).not.toHaveProperty("application_create");
  });

  it("returns a safe 429 error", () => {
    const error = new UsageLimitError("ats_analysis", 2, 2);
    expect(error.statusCode).toBe(429);
    expect(error.message).toContain("2/2");
  });
});
