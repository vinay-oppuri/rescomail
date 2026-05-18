import { auth } from "@repo/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { resumeUploadSchema } from "@repo/validations";

import { createResumeUpload } from "@/modules/resumes/server/resumes";
import { triggerResumeParsing } from "@/modules/resumes/server/resume-parsing";

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
        console.log("Upload completed, starting onUploadComplete handler...");
        const resume = await createResumeUpload({
          userId: metadata.userId,
          title: metadata.title,
          fileUrl: file.ufsUrl || file.url,
          fileKey: file.key,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });

        console.log("Database record created:", resume.id);

        const parsing = await triggerResumeParsing({
          resumeId: resume.id,
          userId: metadata.userId,
          fileUrl: resume.fileUrl,
          fileKey: resume.fileKey,
          fileName: resume.fileName,
          mimeType: resume.mimeType,
        });

        console.log("Resume parsing triggered, status:", parsing.status);

        return {
          resumeId: resume.id,
          title: resume.title,
          status: parsing.status,
          parsingTriggered: parsing.triggered,
        };
      } catch (error) {
        console.error("=========================================");
        console.error("ERROR IN ONUPLOADCOMPLETE CALLBACK:", error);
        console.error("=========================================");
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
