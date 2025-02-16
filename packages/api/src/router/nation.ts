import { z } from "zod";

import { eq, schema } from "@f3/db";
import { NationInsertSchema } from "@f3/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const nationRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const nations = await ctx.db
      .select({
        id: schema.orgs.id,
        parentId: schema.orgs.parentId,
        name: schema.orgs.name,
        orgTypeId: schema.orgs.orgTypeId,
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
      .innerJoin(schema.orgTypes, eq(schema.orgs.orgTypeId, schema.orgTypes.id))
      .where(eq(schema.orgTypes.name, "Nation"));

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

    .input(NationInsertSchema.partial({ id: true, orgTypeId: true }))
    .mutation(async ({ ctx, input }) => {
      const nationOrgType = await ctx.db
        .select({
          id: schema.orgTypes.id,
        })
        .from(schema.orgTypes)
        .where(eq(schema.orgTypes.name, "Nation"));

      if (nationOrgType === undefined)
        throw new Error("Nation org type not found");

      const nationToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        orgTypeId: nationOrgType[0]?.id ?? -1,
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
      await ctx.db.delete(schema.orgs).where(eq(schema.orgs.id, input.id));
    }),
});
