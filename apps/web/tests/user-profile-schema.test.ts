import { describe, expect, it } from "vitest";

import { userProfileUpdateSchema } from "@/modules/dashboard/server/user-profile-schema";

describe("user profile update validation", () => {
  it("accepts null optional fields sent by the profile forms", () => {
    const result = userProfileUpdateSchema.parse({
      full_name: "Jane Doe",
      email: "jane@example.com",
      phone: null,
      location: null,
      portfolio_url: null,
      github_url: null,
      linkedin_url: null,
      extra_links: [],
    });

    expect(result).toMatchObject({
      phone: "",
      location: "",
      portfolio_url: "",
      github_url: "",
      linkedin_url: "",
    });
  });

  it("keeps omitted fields omitted during partial updates", () => {
    const result = userProfileUpdateSchema.parse({
      last_prompted_at: "2026-08-03T00:00:00.000Z",
    });

    expect(result).toEqual({
      last_prompted_at: "2026-08-03T00:00:00.000Z",
    });
  });

  it("still rejects invalid profile URLs", () => {
    const result = userProfileUpdateSchema.safeParse({
      portfolio_url: "not-a-url",
    });

    expect(result.success).toBe(false);
  });
});
