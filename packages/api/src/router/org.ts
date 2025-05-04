import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { OrgMeta } from "@acme/shared/app/types";
import {
  aliasedTable,
  and,
  countDistinct,
  eq,
  ilike,
  inArray,
  or,
  schema,
} from "@acme/db";
import { IsActiveStatus, OrgType } from "@acme/shared/app/enums";
import { OrgInsertSchema, SortingSchema } from "@acme/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { getSortingColumns } from "../get-sorting-columns";
import { adminProcedure, createTRPCRouter, editorProcedure } from "../trpc";
import { withPagination } from "../with-pagination";

export const orgRouter = createTRPCRouter({
  all: editorProcedure
    .input(
      z.object({
        orgTypes: z.enum(OrgType).array().min(1),
        pageIndex: z.number().optional(),
        pageSize: z.number().optional(),
        searchTerm: z.string().optional(),
        sorting: SortingSchema.optional(),
        statuses: z.enum(IsActiveStatus).array().optional(),
        parentOrgIds: z.number().array().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const org = aliasedTable(schema.orgs, "org");
      const parentOrg = aliasedTable(schema.orgs, "parent_org");
      const pageSize = input?.pageSize ?? 10;
      const pageIndex = (input?.pageIndex ?? 0) * pageSize;
      const usePagination =
        input?.pageIndex !== undefined && input?.pageSize !== undefined;

      const where = and(
        inArray(org.orgType, input.orgTypes),
        !input?.statuses?.length ||
          input.statuses.length === IsActiveStatus.length
          ? undefined
          : input.statuses.includes("active")
            ? eq(org.isActive, true)
            : eq(org.isActive, false),
        input?.searchTerm
          ? or(
              ilike(org.name, `%${input?.searchTerm}%`),
              ilike(org.description, `%${input?.searchTerm}%`),
            )
          : undefined,
        input?.parentOrgIds?.length
          ? inArray(org.parentId, input.parentOrgIds)
          : undefined,
      );

      const sortedColumns = getSortingColumns(
        input?.sorting,
        {
          id: org.id,
          name: org.name,
          parentOrgName: parentOrg.name,
          status: org.isActive,
          created: org.created,
        },
        "id",
      );

      const [orgCount] = await ctx.db
        .select({ count: countDistinct(org.id) })
        .from(org)
        .leftJoin(parentOrg, eq(org.parentId, parentOrg.id))
        .where(where);

      const select = {
        id: org.id,
        parentId: org.parentId,
        name: org.name,
        orgType: org.orgType,
        defaultLocationId: org.defaultLocationId,
        description: org.description,
        isActive: org.isActive,
        logoUrl: org.logoUrl,
        website: org.website,
        email: org.email,
        twitter: org.twitter,
        facebook: org.facebook,
        instagram: org.instagram,
        lastAnnualReview: org.lastAnnualReview,
        meta: org.meta,
        created: org.created,
        parentOrgName: parentOrg.name,
        parentOrgType: parentOrg.orgType,
      };
      const query = ctx.db
        .select(select)
        .from(org)
        .leftJoin(parentOrg, eq(org.parentId, parentOrg.id))
        .where(where);

      const orgs_untyped = usePagination
        ? await withPagination(
            query.$dynamic(),
            sortedColumns,
            pageIndex,
            pageSize,
          )
        : await query;

      // Something is broken with org to org types
      interface Org {
        id: number;
        parentId: number | null;
        name: string;
        orgType: "ao" | "region" | "area" | "sector" | "nation";
        defaultLocationId: number | null;
        description: string | null;
        isActive: boolean;
        logoUrl: string | null;
        website: string | null;
        email: string | null;
        twitter: string | null;
        facebook: string | null;
        instagram: string | null;
        lastAnnualReview: string | null;
        meta: OrgMeta;
        created: string;
        parentOrgName: string;
        parentOrgType: "ao" | "region" | "area" | "sector" | "nation";
      }

      return { orgs: orgs_untyped as Org[], total: orgCount?.count ?? 0 };
    }),

  byId: editorProcedure
    .input(z.object({ id: z.number(), orgType: z.enum(OrgType).optional() }))
    .query(async ({ ctx, input }) => {
      const [org] = await ctx.db
        .select()
        .from(schema.orgs)
        .where(
          and(
            eq(schema.orgs.id, input.id),
            input.orgType ? eq(schema.orgs.orgType, input.orgType) : undefined,
          ),
        );
      return org;
    }),

  crupdate: editorProcedure
    .input(OrgInsertSchema.partial({ id: true, parentId: true }))
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
        if (existingOrg?.orgType !== input.orgType) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `org to edit is not a ${input.orgType}`,
          });
        }
      }

      const orgToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      const [result] = await ctx.db
        .insert(schema.orgs)
        .values(orgToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: orgToCrupdate,
        })
        .returning();
      return result;
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number(), orgType: z.enum(OrgType).optional() }))
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
            input.orgType ? eq(schema.orgs.orgType, input.orgType) : undefined,
            eq(schema.orgs.isActive, true),
          ),
        );
    }),
  revalidate: adminProcedure.mutation(async ({ ctx }) => {
    const [nation] = await ctx.db
      .select({ id: schema.orgs.id })
      .from(schema.orgs)
      .where(eq(schema.orgs.orgType, "nation"));
    if (!nation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nation not found",
      });
    }

    const roleCheckResult = await checkHasRoleOnOrg({
      orgId: nation.id,
      session: ctx.session,
      db: ctx.db,
      roleName: "admin",
    });
    if (!roleCheckResult.success) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to revalidate this Nation",
      });
    }

    revalidatePath("/");
  }),
});
