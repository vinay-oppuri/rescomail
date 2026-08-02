import { relations } from "drizzle-orm";

import { atsAnalyses } from "./ats";
import { user, userPreferences } from "./auth";
import { coldEmails } from "./coldmail";
import { resumes } from "./resumes";
import { usageEvents } from "./usage";

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  user: one(user, {
    fields: [usageEvents.userId],
    references: [user.id],
  }),
}));

export const resumesRelations = relations(resumes, ({ many, one }) => ({
  user: one(user, {
    fields: [resumes.userId],
    references: [user.id],
  }),
  atsAnalyses: many(atsAnalyses),
  coldEmails: many(coldEmails),
}));

export const atsAnalysesRelations = relations(atsAnalyses, ({ one }) => ({
  user: one(user, {
    fields: [atsAnalyses.userId],
    references: [user.id],
  }),
  resume: one(resumes, {
    fields: [atsAnalyses.resumeId],
    references: [resumes.id],
  }),
}));

export const coldEmailsRelations = relations(coldEmails, ({ one }) => ({
  user: one(user, {
    fields: [coldEmails.userId],
    references: [user.id],
  }),
  resume: one(resumes, {
    fields: [coldEmails.resumeId],
    references: [resumes.id],
  }),
}));

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userPreferences.userId],
      references: [user.id],
    }),
  }),
);
