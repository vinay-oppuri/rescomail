import { relations } from "drizzle-orm";

import { atsAnalyses } from "./ats";
import { user } from "./auth";
import { subscriptions } from "./billing";
import { organizationMembers, organizations } from "./organizations";
import { resumes } from "./resumes";
import { usageEvents } from "./usage";

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
