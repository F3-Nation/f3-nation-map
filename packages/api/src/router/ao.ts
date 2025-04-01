import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  aliasedTable,
  and,
  countDistinct,
  eq,
  ilike,
  or,
  schema,
} from "@acme/db";
import { AOInsertSchema, SortingSchema } from "@acme/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { getSortingColumns } from "../get-sorting-columns";
import {
  adminProcedure,
  createTRPCRouter,
  editorProcedure,
  publicProcedure,
} from "../trpc";
import { withPagination } from "../with-pagination";

export const aoRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z
        .object({
          pageIndex: z.number().optional(),
          pageSize: z.number().optional(),
          searchTerm: z.string().optional(),
          sorting: SortingSchema.optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const aoOrg = aliasedTable(schema.orgs, "ao_org");
      const regionOrg = aliasedTable(schema.orgs, "region_org");
      const pageSize = input?.pageSize ?? 10;
      const pageIndex = (input?.pageIndex ?? 0) * pageSize;
      const usePagination =
        input?.pageIndex !== undefined && input?.pageSize !== undefined;

      const where = and(
        eq(aoOrg.orgType, "ao"),
        eq(aoOrg.isActive, true),
        input?.searchTerm
          ? or(
              ilike(aoOrg.name, `%${input?.searchTerm}%`),
              ilike(aoOrg.description, `%${input?.searchTerm}%`),
            )
          : undefined,
      );

      const sortedColumns = getSortingColumns(
        input?.sorting,
        {
          id: aoOrg.id,
          regions: regionOrg.name,
          location: aoOrg.name,
          status: schema.events.isActive,
          dayOfWeek: schema.events.dayOfWeek,
          created: schema.events.created,
        },
        "id",
      );

      const [aoCount] = await ctx.db
        .select({ count: countDistinct(aoOrg.id) })
        .from(aoOrg)
        .innerJoin(regionOrg, eq(aoOrg.parentId, regionOrg.id))
        .where(where);

      const select = {
        id: aoOrg.id,
        parentId: aoOrg.parentId,
        name: aoOrg.name,
        orgType: aoOrg.orgType,
        defaultLocationId: aoOrg.defaultLocationId,
        description: aoOrg.description,
        isActive: aoOrg.isActive,
        logoUrl: aoOrg.logoUrl,
        website: aoOrg.website,
        email: aoOrg.email,
        twitter: aoOrg.twitter,
        facebook: aoOrg.facebook,
        instagram: aoOrg.instagram,
        lastAnnualReview: aoOrg.lastAnnualReview,
        meta: aoOrg.meta,
        created: aoOrg.created,
        region: regionOrg.name,
      };
      const query = ctx.db
        .select(select)
        .from(aoOrg)
        .innerJoin(regionOrg, eq(aoOrg.parentId, regionOrg.id))
        .where(where);

      const aos = usePagination
        ? await withPagination(
            query.$dynamic(),
            sortedColumns,
            pageIndex,
            pageSize,
          )
        : await query;

      return { aos, total: aoCount?.count ?? 0 };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [ao] = await ctx.db
        .select()
        .from(schema.orgs)
        .where(
          and(eq(schema.orgs.id, input.id), eq(schema.orgs.orgType, "ao")),
        );
      return { ...ao };
    }),

  crupdate: editorProcedure
    .input(AOInsertSchema.partial({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const orgIdToCheck = input.id ?? input.parentId;
      if (!orgIdToCheck) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Parent ID or ID is required",
        });
      }
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: orgIdToCheck,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this AO",
        });
      }

      if (input.id) {
        const [existingOrg] = await ctx.db
          .select()
          .from(schema.orgs)
          .where(eq(schema.orgs.id, input.id));
        if (existingOrg?.orgType !== "ao") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "org to edit is not an AO",
          });
        }
      }

      const aoToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        orgType: "ao",
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      const [result] = await ctx.db
        .insert(schema.orgs)
        .values(aoToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: aoToCrupdate,
        })
        .returning();
      return result;
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: input.id,
        session: ctx.session,
        db: ctx.db,
        roleName: "admin",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this AO",
        });
      }
      await ctx.db
        .update(schema.orgs)
        .set({ isActive: false })
        .where(
          and(
            eq(schema.orgs.id, input.id),
            eq(schema.orgs.orgType, "ao"),
            eq(schema.orgs.isActive, true),
          ),
        );
    }),
});
