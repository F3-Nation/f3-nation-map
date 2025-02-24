import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { UserRole } from "@f3/shared/app/enums";
import { and, eq, schema as schemaRaw, sql } from "@f3/db";
import { CrupdateUserSchema } from "@f3/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { createTRPCRouter, editorProcedure, publicProcedure } from "../trpc";

const schema = { ...schemaRaw, users: schemaRaw.users };

export const userRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db
      .select({
        id: schema.users.id,
        f3Name: schema.users.f3Name,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        email: schema.users.email,
        emailVerified: schema.users.emailVerified,
        phone: schema.users.phone,
        homeRegionId: schema.users.homeRegionId,
        avatarUrl: schema.users.avatarUrl,
        emergencyContact: schema.users.emergencyContact,
        emergencyPhone: schema.users.emergencyPhone,
        emergencyNotes: schema.users.emergencyNotes,
        status: schema.users.status,
        meta: schema.users.meta,
        created: schema.users.created,
        updated: schema.users.updated,
        roles: sql<
          { orgId: number; orgName: string; roleName: UserRole }[]
        >`COALESCE(
          json_agg(
            json_build_object(
              'orgId', ${schema.orgs.id}, 
              'orgName', ${schema.orgs.name}, 
              'roleName', ${schema.roles.name}
            )
          ) 
          FILTER (
            WHERE ${schema.orgs.id} IS NOT NULL
          ), 
          '[]'
        )`,
      })
      .from(schema.users)
      .leftJoin(
        schema.rolesXUsersXOrg,
        eq(schema.users.id, schema.rolesXUsersXOrg.userId),
      )
      .leftJoin(schema.orgs, eq(schema.orgs.id, schema.rolesXUsersXOrg.orgId))
      .leftJoin(
        schema.roles,
        eq(schema.roles.id, schema.rolesXUsersXOrg.roleId),
      )
      .groupBy(schema.users.id);
    return users.map((user) => ({
      ...user,
      name: `${user.firstName} ${user.lastName}`,
    }));
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          id: schema.users.id,
          f3Name: schema.users.f3Name,
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          email: schema.users.email,
          status: schema.users.status,
          roles: sql<
            { orgId: number; orgName: string; roleName: UserRole }[]
          >`COALESCE(
            json_agg(
              json_build_object(
                'orgId', ${schema.orgs.id}, 
                'orgName', ${schema.orgs.name}, 
                'roleName', ${schema.roles.name}
              )
            ) 
            FILTER (
              WHERE ${schema.orgs.id} IS NOT NULL
            ), 
            '[]'
          )`,
        })
        .from(schema.users)
        .leftJoin(
          schema.rolesXUsersXOrg,
          eq(schema.users.id, schema.rolesXUsersXOrg.userId),
        )
        .leftJoin(schema.orgs, eq(schema.orgs.id, schema.rolesXUsersXOrg.orgId))
        .leftJoin(
          schema.roles,
          eq(schema.roles.id, schema.rolesXUsersXOrg.roleId),
        )
        .groupBy(schema.users.id)
        .where(eq(schema.users.id, input.id));
      return user ?? null;
    }),
  crupdate: editorProcedure
    .input(CrupdateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { roles, ...rest } = input;
      const [user] = await ctx.db
        .insert(schema.users)
        .values({
          ...rest,
        })
        .onConflictDoUpdate({
          target: [schema.users.id],
          set: input,
        })
        .returning();

      if (!user) {
        throw new Error("User not found");
      }

      const dbRoles = await ctx.db.select().from(schema.roles);

      const roleNameToId = dbRoles.reduce(
        (acc, role) => {
          if (role.name) {
            acc[role.name] = role.id;
          }
          return acc;
        },
        {} as Record<UserRole, number>,
      );

      const existingRoles = await ctx.db
        .select()
        .from(schema.rolesXUsersXOrg)
        .where(eq(schema.rolesXUsersXOrg.userId, user.id));
      console.log("Existing roles", existingRoles);

      const newRolesToInsert = roles.filter(
        (role) =>
          !existingRoles.some(
            (existingRole) =>
              existingRole.roleId === roleNameToId[role.roleName] &&
              existingRole.orgId === role.orgId,
          ),
      );
      console.log("New roles to insert", newRolesToInsert);

      for (const role of newRolesToInsert) {
        const { success } = await checkHasRoleOnOrg({
          orgId: role.orgId,
          session: ctx.session,
          db: ctx.db,
          roleName: "admin",
        });
        if (!success) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "You do not have permission to give this role to this user",
          });
        } else {
          console.log("User has role", success);
        }
      }

      const rolesToDelete = existingRoles.filter(
        (existingRole) =>
          !roles.some(
            (role) =>
              roleNameToId[role.roleName] === existingRole.roleId &&
              role.orgId === existingRole.orgId,
          ),
      );
      console.log("Roles to delete", rolesToDelete);

      for (const role of rolesToDelete) {
        const { success } = await checkHasRoleOnOrg({
          orgId: role.orgId,
          session: ctx.session,
          db: ctx.db,
          roleName: "admin",
        });
        if (!success) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "You do not have permission to remove this role from this user",
          });
        } else {
          console.log("User has role", success);
        }

        await ctx.db
          .delete(schema.rolesXUsersXOrg)
          .where(
            and(
              eq(schema.rolesXUsersXOrg.userId, user.id),
              eq(schema.rolesXUsersXOrg.orgId, role.orgId),
              eq(schema.rolesXUsersXOrg.roleId, role.roleId),
            ),
          );
      }

      if (newRolesToInsert.length > 0) {
        await ctx.db.insert(schema.rolesXUsersXOrg).values(
          newRolesToInsert.map((role) => ({
            userId: user.id,
            roleId: roleNameToId[role.roleName],
            orgId: role.orgId,
          })),
        );
      }

      const updatedRoles = await ctx.db
        .select({
          orgId: schema.rolesXUsersXOrg.orgId,
          orgName: schema.orgs.name,
          roleName: schema.roles.name,
        })
        .from(schema.rolesXUsersXOrg)
        .leftJoin(schema.orgs, eq(schema.orgs.id, schema.rolesXUsersXOrg.orgId))
        .leftJoin(
          schema.roles,
          eq(schema.roles.id, schema.rolesXUsersXOrg.roleId),
        )
        .where(eq(schema.rolesXUsersXOrg.userId, user.id));

      return {
        ...user,
        roles: updatedRoles,
      };
    }),
});
