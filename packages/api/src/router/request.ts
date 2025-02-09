import omit from "lodash/omit";
import { z } from "zod";

import { desc, eq, schema } from "@f3/db";
import { env } from "@f3/env";

import { mail, Templates } from "../mail";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const requestRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db
      .select({
        id: schema.updateRequests.id,
        submittedBy: schema.updateRequests.submittedBy,
        submitterValidated: schema.updateRequests.submitterValidated,
        regionName: schema.orgs.name,
        workoutName: schema.events.name,
        created: schema.updateRequests.created,
      })
      .from(schema.updateRequests)
      .innerJoin(schema.orgs, eq(schema.updateRequests.orgId, schema.orgs.id))
      .innerJoin(
        schema.events,
        eq(schema.updateRequests.eventId, schema.events.id),
      )
      .orderBy(desc(schema.updateRequests.created));
    return requests.map((request) => ({
      ...request,
    }));
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [request] = await ctx.db
        .select()
        .from(schema.updateRequests)
        .where(eq(schema.updateRequests.id, input.id));
      return request;
    }),

  updateLocation: publicProcedure
    .input(
      z.object({
        id: z.string(),
        locationName: z.string().nullish(),
        locationDescription: z.string().nullish(),
        locationLat: z.number().nullish(),
        locationLng: z.number().nullish(),
        locationId: z.number().nullish(),

        eventName: z.string(),
        eventDescription: z.string().nullish(),
        eventStartTime: z.string().nullish(),
        eventEndTime: z.string().nullish(),
        eventDayOfWeek: z.string(),
        eventId: z.number().nullable(),
        eventTypes: z
          .object({ id: z.number(), name: z.string() })
          .array()
          .nullable(),
        eventTag: z.string().nullable(),
        eventIsSeries: z.boolean().nullish(),
        eventIsActive: z.boolean().nullish(),
        eventHighlight: z.boolean().nullish(),
        eventStartDate: z.string().nullish(),
        eventEndDate: z.string().nullish(),
        eventRecurrencePattern: z.string().nullish(),
        eventRecurrenceInterval: z.number().nullish(),
        eventIndexWithinInterval: z.number().nullish(),
        eventMeta: z.record(z.string(), z.unknown()).nullish(),

        orgId: z.number(),
        submittedBy: z.string().email().optional(),
        meta: z.record(z.string(), z.unknown()).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const submittedBy = ctx.session?.user?.email ?? input.submittedBy;
      if (!submittedBy) {
        throw new Error("Submitted by is required");
      }
      const updateRequest: typeof schema.updateRequests.$inferInsert = {
        ...input,
        eventTypeIds: input.eventTypes?.map((type) => type.id),
        submittedBy,
        submitterValidated: false,
        validatedBy: null,
        validatedAt: null,
      };

      const [inserted] = await ctx.db
        .insert(schema.updateRequests)
        .values(updateRequest)
        .returning();

      if (!inserted) {
        throw new Error("Failed to insert update request");
      }
      const [region] = await ctx.db
        .select()
        .from(schema.orgs)
        .where(eq(schema.orgs.id, input.orgId));

      if (!region) {
        throw new Error("Failed to find region");
      }

      await mail.sendTemplateMessages(Templates.validateSubmission, {
        to: input.submittedBy,
        submissionId: inserted.id,
        token: inserted.token,
        regionName: region?.name,
        eventName: inserted.eventName,
        address: inserted.locationDescription ?? "",
        startTime: inserted.eventStartTime ?? "",
        endTime: inserted.eventEndTime ?? "",
        dayOfWeek: inserted.eventDayOfWeek ?? "",
        types: input.eventTypes?.map((type) => type.name).join(", ") ?? "",
        url: env.NEXT_PUBLIC_URL,
      });

      return { success: true, inserted: omit(inserted, ["token"]) };
    }),
  validateSubmission: publicProcedure
    .input(z.object({ token: z.string(), submissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [updateRequest] = await ctx.db
        .select()
        .from(schema.updateRequests)
        .where(eq(schema.updateRequests.id, input.submissionId));

      if (!updateRequest) {
        throw new Error("Failed to find update request");
      }

      if (updateRequest.token !== input.token) {
        throw new Error("Invalid token");
      }

      const [updated] = await ctx.db
        .update(schema.updateRequests)
        .set({ submitterValidated: true })
        .where(eq(schema.updateRequests.id, input.submissionId))
        .returning();

      return { success: true, updateRequest: omit(updated, ["token"]) };
    }),
});
