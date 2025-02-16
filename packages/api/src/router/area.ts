import { z } from "zod";

import { aliasedTable, eq, schema } from "@f3/db";
import { AreaInsertSchema } from "@f3/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const areaRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const areaOrg = aliasedTable(schema.orgs, "area_org");
    const sectorOrg = aliasedTable(schema.orgs, "sector_org");
    const nationOrg = aliasedTable(schema.orgs, "nation_org");

    const areas = await ctx.db
      .select({
        id: areaOrg.id,
        name: areaOrg.name,
        orgTypeId: areaOrg.orgTypeId,
        defaultLocationId: areaOrg.defaultLocationId,
        description: areaOrg.description,
        isActive: areaOrg.isActive,
        logoUrl: areaOrg.logoUrl,
        website: areaOrg.website,
        email: areaOrg.email,
        twitter: areaOrg.twitter,
        facebook: areaOrg.facebook,
        instagram: areaOrg.instagram,
        lastAnnualReview: areaOrg.lastAnnualReview,
        meta: areaOrg.meta,
        created: areaOrg.created,
        sector: sectorOrg.name,
        nation: nationOrg.name,
      })
      .from(areaOrg)
      .innerJoin(sectorOrg, eq(areaOrg.parentId, sectorOrg.id))
      .innerJoin(nationOrg, eq(sectorOrg.parentId, nationOrg.id))
      .innerJoin(schema.orgTypes, eq(areaOrg.orgTypeId, schema.orgTypes.id))
      .where(eq(schema.orgTypes.name, "Area"));

    return areas;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const areaOrg = aliasedTable(schema.orgs, "area_org");
      const [area] = await ctx.db
        .select()
        .from(areaOrg)
        .where(eq(areaOrg.id, input.id));
      return { ...area };
    }),

  crupdate: publicProcedure

    .input(AreaInsertSchema.partial({ id: true, orgTypeId: true }))
    .mutation(async ({ ctx, input }) => {
      const areaOrgType = await ctx.db
        .select({
          id: schema.orgTypes.id,
        })
        .from(schema.orgTypes)
        .where(eq(schema.orgTypes.name, "Area"));

      if (areaOrgType === undefined) throw new Error("Area org type not found");

      const areaToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        orgTypeId: areaOrgType[0]?.id ?? -1,
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      await ctx.db
        .insert(schema.orgs)
        .values(areaToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: areaToCrupdate,
        });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(schema.orgs).where(eq(schema.orgs.id, input.id));
    }),
});
