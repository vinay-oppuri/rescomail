import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "../lib/server/secrets";

describe("BYOK encryption", () => {
  it("round trips only in the same user and provider context", () => {
    const encrypted = encryptSecret("my-super-secret-key-1234!", "user-1", "gemini");
    expect(encrypted).toMatch(/^enc:v2\./);
    expect(decryptSecret(encrypted, "user-1", "gemini")).toBe("my-super-secret-key-1234!");
    expect(decryptSecret(encrypted, "user-2", "gemini")).toBeNull();
    expect(decryptSecret(encrypted, "user-1", "groq")).toBeNull();
  });

  it("rejects plaintext, malformed, and tampered values", () => {
    const encrypted = encryptSecret("another-secret", "user-1", "groq");
    expect(decryptSecret("plaintext", "user-1", "groq")).toBeNull();
    expect(decryptSecret(`${encrypted}x`, "user-1", "groq")).toBeNull();
    expect(decryptSecret(null, "user-1", "groq")).toBeNull();
  });

  it("rejects empty secrets", () => {
    expect(() => encryptSecret("   ", "user-1", "gemini")).toThrow("Cannot encrypt an empty secret.");
  });
});
