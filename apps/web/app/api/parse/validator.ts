import { z } from "zod";
import { StructuredResume } from "./ai-structurer";

const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required").default("John Doe"),
  email: z.string().email("Invalid email").or(z.string().min(1)).default("email@example.com"),
  phone: z.string().default("Not Provided"),
});

const experienceItemSchema = z.object({
  role: z.string().default("Software Developer"),
  company: z.string().default("Company / Organization"),
  duration: z.string().default("Present"),
  description: z.string().default(""),
});

const educationItemSchema = z.object({
  degree: z.string().default("Degree Certificate"),
  school: z.string().default("Institution"),
  year: z.string().default(""),
});

export const structuredResumeSchema = z.object({
  personalInfo: personalInfoSchema,
  skills: z.array(z.string()).default([]),
  experience: z.array(experienceItemSchema).default([]),
  education: z.array(educationItemSchema).default([]),
});

export function validateStructuredResume(data: any): StructuredResume {
  console.log("[Validator] Validating parsed resume structure...");
  const result = structuredResumeSchema.safeParse(data);
  
  if (!result.success) {
    console.warn("[Validator] Validation warnings found, parsing fallback defaults:", result.error.format());
    // Safe fallback parse
    return structuredResumeSchema.parse(data || {});
  }
  
  return result.data;
}
