import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { serverEnv } from "@repo/env/server";

export type SecretProvider = "gemini" | "groq";

const PREFIX = "enc:v2";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;

const sourceKey = serverEnv.DATA_ENCRYPTION_KEY;

const encryptionKey = createHash("sha256")
  .update(`rescomail:byok:v2:${sourceKey ?? serverEnv.BETTER_AUTH_SECRET}`)
  .digest();

const context = (userId: string, provider: SecretProvider) =>
  Buffer.from(`rescomail:${userId}:${provider}:v2`, "utf8");

export const encryptSecret = (
  secret: string,
  userId: string,
  provider: SecretProvider,
): string => {
  const value = secret.trim();
  if (!value) throw new Error("Cannot encrypt an empty secret.");

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, encryptionKey, iv, {
    authTagLength: TAG_BYTES,
  });
  cipher.setAAD(context(userId, provider));
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return [
    PREFIX,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
};

export const decryptSecret = (
  stored: string | null | undefined,
  userId: string,
  provider: SecretProvider,
): string | null => {
  if (!stored?.startsWith(`${PREFIX}.`)) return null;
  const [prefix, ivValue, tagValue, encryptedValue, ...extra] =
    stored.split(".");
  if (
    prefix !== PREFIX ||
    !ivValue ||
    !tagValue ||
    !encryptedValue ||
    extra.length
  )
    return null;

  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      encryptionKey,
      Buffer.from(ivValue, "base64url"),
      { authTagLength: TAG_BYTES },
    );
    decipher.setAAD(context(userId, provider));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
};

export const hasUsableSecret = (
  stored: string | null | undefined,
  userId: string,
  provider: SecretProvider,
) => Boolean(decryptSecret(stored, userId, provider));

export const maskSecret = (
  stored: string | null | undefined,
  userId: string,
  provider: SecretProvider,
) => {
  const secret = decryptSecret(stored, userId, provider);
  if (!secret) return null;
  return `${secret.slice(0, 4)}${"*".repeat(12)}${secret.length > 8 ? secret.slice(-4) : ""}`;
};
