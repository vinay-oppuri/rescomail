import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

import { serverEnv } from "@repo/env/server";

const ENCRYPTED_SECRET_PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

const key = createHash("sha256")
  .update(
    `rescomail:secret-store:${
      serverEnv.DATA_ENCRYPTION_KEY ?? serverEnv.BETTER_AUTH_SECRET
    }`,
  )
  .digest();

const toBase64Url = (value: Buffer) => value.toString("base64url");
const fromBase64Url = (value: string) => Buffer.from(value, "base64url");

export const encryptSecret = (secret: string): string => {
  const trimmed = secret.trim();

  if (!trimmed) {
    throw new Error("Cannot encrypt an empty secret.");
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_BYTES,
  });
  const encrypted = Buffer.concat([
    cipher.update(trimmed, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTED_SECRET_PREFIX,
    toBase64Url(iv),
    toBase64Url(authTag),
    toBase64Url(encrypted),
  ].join(".");
};

export const decryptSecret = (storedSecret: string | null | undefined) => {
  if (!storedSecret) {
    return null;
  }

  if (!storedSecret.startsWith(ENCRYPTED_SECRET_PREFIX)) {
    return storedSecret;
  }

  const payload = storedSecret.slice(ENCRYPTED_SECRET_PREFIX.length);
  const [iv, authTag, encrypted, ...extra] = payload.split(".");

  if (!iv || !authTag || !encrypted || extra.length > 0) {
    return null;
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, key, fromBase64Url(iv), {
      authTagLength: AUTH_TAG_BYTES,
    });
    decipher.setAuthTag(fromBase64Url(authTag));

    return Buffer.concat([
      decipher.update(fromBase64Url(encrypted)),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
};

export const hasUsableSecret = (storedSecret: string | null | undefined) =>
  Boolean(decryptSecret(storedSecret)?.trim());

export const maskSecret = (storedSecret: string | null | undefined) => {
  const secret = decryptSecret(storedSecret)?.trim();

  if (!secret) {
    return null;
  }

  const prefix = secret.slice(0, 4);
  const suffix = secret.length > 8 ? secret.slice(-4) : "";

  return `${prefix}${"*".repeat(16)}${suffix}`;
};
