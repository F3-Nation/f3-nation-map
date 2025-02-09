import { and } from "drizzle-orm";
import { z } from "zod";

import { aliasedTable, eq, schema } from "@f3/db";
import { RegionInsertSchema } from "@f3/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const regionRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const regionOrg = aliasedTable(schema.orgs, "region_org");

    const regions = await ctx.db
      .select({
        id: regionOrg.id,
        name: regionOrg.name,
        orgTypeId: regionOrg.orgTypeId,
        defaultLocationId: regionOrg.defaultLocationId,
        description: regionOrg.description,
        isActive: regionOrg.isActive,
        logoUrl: regionOrg.logoUrl,
        website: regionOrg.website,
        email: regionOrg.email,
        twitter: regionOrg.twitter,
        facebook: regionOrg.facebook,
        instagram: regionOrg.instagram,
        lastAnnualReview: regionOrg.lastAnnualReview,
        meta: regionOrg.meta,
        created: regionOrg.created,
        area: schema.orgs.name,
      })
      .from(regionOrg)
      .innerJoin(schema.orgTypes, eq(regionOrg.orgTypeId, schema.orgTypes.id))
      .innerJoin(schema.orgs, eq(regionOrg.parentId, schema.orgs.id))
      .where(eq(schema.orgTypes.name, "Region"));

    return regions;
  }),
  allActive: publicProcedure.query(async ({ ctx }) => {
    const regionOrg = aliasedTable(schema.orgs, "region_org");

    const regions = await ctx.db
      .select({
        id: regionOrg.id,
        name: regionOrg.name,
      })
      .from(regionOrg)
      .innerJoin(schema.orgTypes, eq(regionOrg.orgTypeId, schema.orgTypes.id))
      .innerJoin(schema.orgs, eq(regionOrg.parentId, schema.orgs.id))
      .where(
        and(eq(schema.orgTypes.name, "Region"), eq(regionOrg.isActive, true)),
      )
      .orderBy(regionOrg.name);

    return regions;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const regionOrg = aliasedTable(schema.orgs, "region_org");
      const [region] = await ctx.db
        .select()
        .from(regionOrg)
        .where(eq(regionOrg.id, input.id));
      return { ...region };
    }),

  crupdate: publicProcedure
    .input(RegionInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const regionToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      await ctx.db
        .insert(schema.orgs)
        .values(regionToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: regionToCrupdate,
        });
    }),
});
