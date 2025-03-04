import { z } from "zod";

import { and, eq, schema } from "@acme/db";
import { NationInsertSchema } from "@acme/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const nationRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const nations = await ctx.db
      .select({
        id: schema.orgs.id,
        parentId: schema.orgs.parentId,
        name: schema.orgs.name,
        orgType: schema.orgs.orgType,
        defaultLocationId: schema.orgs.defaultLocationId,
        description: schema.orgs.description,
        isActive: schema.orgs.isActive,
        logoUrl: schema.orgs.logoUrl,
        website: schema.orgs.website,
        email: schema.orgs.email,
        twitter: schema.orgs.twitter,
        facebook: schema.orgs.facebook,
        instagram: schema.orgs.instagram,
        lastAnnualReview: schema.orgs.lastAnnualReview,
        meta: schema.orgs.meta,
        created: schema.orgs.created,
      })
      .from(schema.orgs)
      .where(
        and(eq(schema.orgs.orgType, "nation"), eq(schema.orgs.isActive, true)),
      );

    return nations;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [nation] = await ctx.db
        .select()
        .from(schema.orgs)
        .where(eq(schema.orgs.id, input.id));
      return { ...nation };
    }),

  crupdate: publicProcedure
    .input(NationInsertSchema.partial({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const nationToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      await ctx.db
        .insert(schema.orgs)
        .values(nationToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: nationToCrupdate,
        });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(schema.orgs)
        .set({ isActive: false })
        .where(eq(schema.orgs.id, input.id));
    }),
  allOrgs: publicProcedure.query(async ({ ctx }) => {
    const orgs = await ctx.db
      .select()
      .from(schema.orgs)
      .where(eq(schema.orgs.isActive, true));
    return orgs;
  }),
});
