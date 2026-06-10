import { relations } from "drizzle-orm";

import { applications } from "./applications";
import { atsAnalyses } from "./ats";
import { user } from "./auth";
import { subscriptions } from "./billing";
import { coldEmails } from "./coldmail";
import { organizationMembers, organizations } from "./organizations";
import { resumes } from "./resumes";
import { usageEvents } from "./usage";
import { userPreferences } from "./auth";

export const organizationsRelations = relations(
  organizations,
  ({ many, one }) => ({
    owner: one(user, {
      fields: [organizations.ownerId],
      references: [user.id],
    }),
    members: many(organizationMembers),
    resumes: many(resumes),
    atsAnalyses: many(atsAnalyses),
    coldEmails: many(coldEmails),
    usageEvents: many(usageEvents),
    subscriptions: many(subscriptions),
  }),
);

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(user, {
      fields: [organizationMembers.userId],
      references: [user.id],
    }),
  }),
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [usageEvents.organizationId],
    references: [organizations.id],
  }),
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
  organization: one(organizations, {
    fields: [resumes.organizationId],
    references: [organizations.id],
  }),
  atsAnalyses: many(atsAnalyses),
  coldEmails: many(coldEmails),
}));

export const atsAnalysesRelations = relations(atsAnalyses, ({ one }) => ({
  user: one(user, {
    fields: [atsAnalyses.userId],
    references: [user.id],
  }),
  organization: one(organizations, {
    fields: [atsAnalyses.organizationId],
    references: [organizations.id],
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
  organization: one(organizations, {
    fields: [coldEmails.organizationId],
    references: [organizations.id],
  }),
  resume: one(resumes, {
    fields: [coldEmails.resumeId],
    references: [resumes.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(user, {
    fields: [applications.userId],
    references: [user.id],
  }),
  organization: one(organizations, {
    fields: [applications.organizationId],
    references: [organizations.id],
  }),
  resume: one(resumes, {
    fields: [applications.resumeId],
    references: [resumes.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userPreferences.userId],
    references: [user.id],
  }),
}));
