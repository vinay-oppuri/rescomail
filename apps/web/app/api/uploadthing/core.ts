import { auth } from "@repo/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { resumeUploadSchema } from "@repo/validations";

import {
  createResumeUpload,
  markResumeParsingFailed,
} from "@/modules/resumes/server/resumes";
import { parseResumeTask } from "@/trigger/parse-resume";

const f = createUploadthing();

const resumeUploadInput = resumeUploadSchema;

export const ourFileRouter = {
  resumeUploader: f(
    {
      pdf: {
        maxFileSize: "8MB",
        maxFileCount: 1,
        minFileCount: 1,
      },
    },
    { awaitServerData: true },
  )
    .input(resumeUploadInput)
    .middleware(async ({ req, input }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user?.id) {
        throw new UploadThingError("You must be signed in to upload a resume.");
      }

      return {
        userId: session.user.id,
        title: input.title,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const resume = await createResumeUpload({
          userId: metadata.userId,
          title: metadata.title,
          fileUrl: file.ufsUrl || file.url,
          fileKey: file.key,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });

        try {
          await parseResumeTask.trigger(
            {
              resumeId: resume.id,
              userId: metadata.userId,
              fileUrl: resume.fileUrl,
              fileName: resume.fileName,
            },
            {
              idempotencyKey: `parse-resume:${resume.id}`,
            },
          );
        } catch (error) {
          const reason =
            error instanceof Error
              ? error.message
              : "Unable to queue resume parsing.";

          await markResumeParsingFailed(resume.id, metadata.userId, reason);

          return {
            resumeId: resume.id,
            title: resume.title,
            status: "parse_failed",
            parsingTriggered: false,
          };
        }

        return {
          resumeId: resume.id,
          title: resume.title,
          status: "processing",
          parsingTriggered: true,
        };
      } catch (error) {
        console.error("Resume upload completion failed:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
