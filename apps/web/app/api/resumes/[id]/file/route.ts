import { NextRequest, NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { db, resumes } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { internalServerError } from "@/lib/server/api-errors";

const FILE_FETCH_TIMEOUT_MS = 15_000;
const MAX_PROXY_BYTES = 8 * 1024 * 1024;
const ALLOWED_FILE_HOSTS = new Set(["utfs.io", "ufs.sh"]);
const resumeIdSchema = z.string().uuid();

const isAllowedFileUrl = (value: string) => {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      [...ALLOWED_FILE_HOSTS].some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
      )
    );
  } catch {
    return false;
  }
};

const sanitizeFileName = (fileName: string) => {
  const sanitized = fileName
    .replace(/[\r\n"]/g, "")
    .replace(/[\\/]/g, "-")
    .trim();

  return sanitized || "resume.pdf";
};

const readResponseBytes = async (response: Response, maxBytes: number) => {
  if (!response.body) {
    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.byteLength > maxBytes) {
      throw new Error("Downloaded file exceeded the allowed size.");
    }

    return buffer;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    totalBytes += value.byteLength;

    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error("Downloaded file exceeded the allowed size.");
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks);
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const parsedId = resumeIdSchema.safeParse(id);

  if (!parsedId.success) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const resume = await db.query.resumes.findFirst({
    where: and(
      eq(resumes.id, parsedId.data),
      eq(resumes.userId, session.user.id),
    ),
  });

  if (!resume) {
    return new NextResponse("Not Found or Access Denied", { status: 404 });
  }

  if (!isAllowedFileUrl(resume.fileUrl)) {
    return new NextResponse("Stored file location is not allowed", {
      status: 502,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FILE_FETCH_TIMEOUT_MS);
    const response = await fetch(resume.fileUrl, {
      redirect: "manual",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (response.status >= 300 && response.status < 400) {
      return new NextResponse("Unexpected file storage redirect", {
        status: 502,
      });
    }

    if (!response.ok) {
      return new NextResponse("Failed to fetch file from storage", {
        status: 502,
      });
    }

    const contentLength = response.headers.get("content-length");

    if (contentLength && Number(contentLength) > MAX_PROXY_BYTES) {
      return new NextResponse("Stored file is too large", { status: 413 });
    }

    const buffer = await readResponseBytes(response, MAX_PROXY_BYTES);
    const fileName = sanitizeFileName(resume.fileName);

    return new NextResponse(buffer, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Length": String(buffer.byteLength),
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return internalServerError(
      "Error fetching resume file",
      error,
      "Internal Server Error",
    );
  }
}
