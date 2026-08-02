import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "tests/mock-server-only.js"),
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/rescomail_test",
      BETTER_AUTH_SECRET: "test-better-auth-secret-that-is-at-least-32-chars",
      DATA_ENCRYPTION_KEY: "test-encryption-key-that-is-at-least-32-chars",
      TRIGGER_SECRET_KEY: "test-trigger-secret",
      AI_SERVICE_API_KEY: "test-ai-service-key-that-is-at-least-32-chars",
    },
  },
});
