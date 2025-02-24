import { relations } from "drizzle-orm/relations";

import {
  achievements,
  achievementsXUsers,
  attendance,
  attendanceTypes,
  attendanceXAttendanceTypes,
  authAccounts,
  authSessions,
  events,
  eventsXEventTypes,
  eventTags,
  eventTagsXEvents,
  eventTypes,
  expansions,
  expansionsXUsers,
  locations,
  orgs,
  orgsXSlackSpaces,
  permissions,
  positions,
  positionsXOrgsXUsers,
  roles,
  rolesXPermissions,
  rolesXUsersXOrg,
  slackSpaces,
  slackUsers,
  updateRequests,
  users,
} from "./schema";

export const orgsRelations = relations(orgs, ({ one, many }) => ({
  org: one(orgs, {
    fields: [orgs.parentId],
    references: [orgs.id],
    relationName: "orgs_parentId_orgs_id",
  }),
  orgs: many(orgs, {
    relationName: "orgs_parentId_orgs_id",
  }),
  achievements: many(achievements),
  positions: many(positions),
  events: many(events),
  eventTags: many(eventTags),
  locations: many(locations),
  eventTypes: many(eventTypes),
  users: many(users),
  updateRequests: many(updateRequests),
  orgsXSlackSpaces: many(orgsXSlackSpaces),
  positionsXOrgsXUsers: many(positionsXOrgsXUsers),
  rolesXUsersXOrgs: many(rolesXUsersXOrg),
}));

export const achievementsRelations = relations(
  achievements,
  ({ one, many }) => ({
    org: one(orgs, {
      fields: [achievements.specificOrgId],
      references: [orgs.id],
    }),
    achievementsXUsers: many(achievementsXUsers),
  }),
);

export const attendanceRelations = relations(attendance, ({ one, many }) => ({
  event: one(events, {
    fields: [attendance.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
  attendanceXAttendanceTypes: many(attendanceXAttendanceTypes),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  attendances: many(attendance),
  location: one(locations, {
    fields: [events.locationId],
    references: [locations.id],
  }),
  org: one(orgs, {
    fields: [events.orgId],
    references: [orgs.id],
  }),
  event: one(events, {
    fields: [events.seriesId],
    references: [events.id],
    relationName: "events_seriesId_events_id",
  }),
  events: many(events, {
    relationName: "events_seriesId_events_id",
  }),
  updateRequests: many(updateRequests),
  eventTagsXEvents: many(eventTagsXEvents),
  eventsXEventTypes: many(eventsXEventTypes),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  attendances: many(attendance),
  slackUsers: many(slackUsers),
  authAccounts: many(authAccounts),
  authSessions: many(authSessions),
  org: one(orgs, {
    fields: [users.homeRegionId],
    references: [orgs.id],
  }),
  achievementsXUsers: many(achievementsXUsers),
  positionsXOrgsXUsers: many(positionsXOrgsXUsers),
  rolesXUsersXOrgs: many(rolesXUsersXOrg),
  expansionsXUsers: many(expansionsXUsers),
}));

export const positionsRelations = relations(positions, ({ one, many }) => ({
  org: one(orgs, {
    fields: [positions.orgId],
    references: [orgs.id],
  }),
  positionsXOrgsXUsers: many(positionsXOrgsXUsers),
}));

export const slackUsersRelations = relations(slackUsers, ({ one }) => ({
  user: one(users, {
    fields: [slackUsers.userId],
    references: [users.id],
  }),
  slackSpace: one(slackSpaces, {
    fields: [slackUsers.slackTeamId],
    references: [slackSpaces.teamId],
  }),
}));

export const slackSpacesRelations = relations(slackSpaces, ({ many }) => ({
  slackUsers: many(slackUsers),
  orgsXSlackSpaces: many(orgsXSlackSpaces),
}));

export const authAccountsRelations = relations(authAccounts, ({ one }) => ({
  user: one(users, {
    fields: [authAccounts.userId],
    references: [users.id],
  }),
}));

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, {
    fields: [authSessions.userId],
    references: [users.id],
  }),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  events: many(events),
  org: one(orgs, {
    fields: [locations.orgId],
    references: [orgs.id],
  }),
  updateRequests: many(updateRequests),
}));

export const eventTagsRelations = relations(eventTags, ({ one, many }) => ({
  org: one(orgs, {
    fields: [eventTags.specificOrgId],
    references: [orgs.id],
  }),
  eventTagsXEvents: many(eventTagsXEvents),
}));

export const eventTypesRelations = relations(eventTypes, ({ one, many }) => ({
  org: one(orgs, {
    fields: [eventTypes.specificOrgId],
    references: [orgs.id],
  }),
  eventsXEventTypes: many(eventsXEventTypes),
}));

export const updateRequestsRelations = relations(updateRequests, ({ one }) => ({
  event: one(events, {
    fields: [updateRequests.eventId],
    references: [events.id],
  }),
  location: one(locations, {
    fields: [updateRequests.locationId],
    references: [locations.id],
  }),
  org: one(orgs, {
    fields: [updateRequests.regionId],
    references: [orgs.id],
  }),
}));

export const attendanceXAttendanceTypesRelations = relations(
  attendanceXAttendanceTypes,
  ({ one }) => ({
    attendance: one(attendance, {
      fields: [attendanceXAttendanceTypes.attendanceId],
      references: [attendance.id],
    }),
    attendanceType: one(attendanceTypes, {
      fields: [attendanceXAttendanceTypes.attendanceTypeId],
      references: [attendanceTypes.id],
    }),
  }),
);

export const attendanceTypesRelations = relations(
  attendanceTypes,
  ({ many }) => ({
    attendanceXAttendanceTypes: many(attendanceXAttendanceTypes),
  }),
);

export const eventTagsXEventsRelations = relations(
  eventTagsXEvents,
  ({ one }) => ({
    event: one(events, {
      fields: [eventTagsXEvents.eventId],
      references: [events.id],
    }),
    eventTag: one(eventTags, {
      fields: [eventTagsXEvents.eventTagId],
      references: [eventTags.id],
    }),
  }),
);

export const eventsXEventTypesRelations = relations(
  eventsXEventTypes,
  ({ one }) => ({
    event: one(events, {
      fields: [eventsXEventTypes.eventId],
      references: [events.id],
    }),
    eventType: one(eventTypes, {
      fields: [eventsXEventTypes.eventTypeId],
      references: [eventTypes.id],
    }),
  }),
);

export const orgsXSlackSpacesRelations = relations(
  orgsXSlackSpaces,
  ({ one }) => ({
    org: one(orgs, {
      fields: [orgsXSlackSpaces.orgId],
      references: [orgs.id],
    }),
    slackSpace: one(slackSpaces, {
      fields: [orgsXSlackSpaces.slackSpaceId],
      references: [slackSpaces.id],
    }),
  }),
);

export const rolesXPermissionsRelations = relations(
  rolesXPermissions,
  ({ one }) => ({
    permission: one(permissions, {
      fields: [rolesXPermissions.permissionId],
      references: [permissions.id],
    }),
    role: one(roles, {
      fields: [rolesXPermissions.roleId],
      references: [roles.id],
    }),
  }),
);

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolesXPermissions: many(rolesXPermissions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  rolesXPermissions: many(rolesXPermissions),
  rolesXUsersXOrgs: many(rolesXUsersXOrg),
}));

export const achievementsXUsersRelations = relations(
  achievementsXUsers,
  ({ one }) => ({
    achievement: one(achievements, {
      fields: [achievementsXUsers.achievementId],
      references: [achievements.id],
    }),
    user: one(users, {
      fields: [achievementsXUsers.userId],
      references: [users.id],
    }),
  }),
);

export const positionsXOrgsXUsersRelations = relations(
  positionsXOrgsXUsers,
  ({ one }) => ({
    org: one(orgs, {
      fields: [positionsXOrgsXUsers.orgId],
      references: [orgs.id],
    }),
    position: one(positions, {
      fields: [positionsXOrgsXUsers.positionId],
      references: [positions.id],
    }),
    user: one(users, {
      fields: [positionsXOrgsXUsers.userId],
      references: [users.id],
    }),
  }),
);

export const rolesXUsersXOrgRelations = relations(
  rolesXUsersXOrg,
  ({ one }) => ({
    org: one(orgs, {
      fields: [rolesXUsersXOrg.orgId],
      references: [orgs.id],
    }),
    role: one(roles, {
      fields: [rolesXUsersXOrg.roleId],
      references: [roles.id],
    }),
    user: one(users, {
      fields: [rolesXUsersXOrg.userId],
      references: [users.id],
    }),
  }),
);

export const expansionsXUsersRelations = relations(
  expansionsXUsers,
  ({ one }) => ({
    expansion: one(expansions, {
      fields: [expansionsXUsers.expansionId],
      references: [expansions.id],
    }),
    user: one(users, {
      fields: [expansionsXUsers.userId],
      references: [users.id],
    }),
  }),
);

export const expansionsRelations = relations(expansions, ({ many }) => ({
  expansionsXUsers: many(expansionsXUsers),
}));
