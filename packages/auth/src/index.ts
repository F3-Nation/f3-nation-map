import type { Adapter } from "next-auth/adapters";
import NextAuth from "next-auth";
import Email from "next-auth/providers/nodemailer";

import type { UserRole } from "@f3/shared/app/enums";
import { db } from "@f3/db";
import { env } from "@f3/env";

import { MDPGDrizzleAdapter } from "./MDPgDrizzleAdapter";
import { sendVerificationRequest } from "./sendVerificationRequest";

export type { Session } from "next-auth";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  // Must cast since we use number for user ids
  // And next-auth expects string for user ids
  // And it is a nightmare (impossible?) to overwrite the type
  adapter: MDPGDrizzleAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  // Needed to run on cloud build docker deployment (basePath and trustHost)
  // https://github.com/nextauthjs/next-auth/issues/9819#issuecomment-1912903196
  basePath: "/api/auth",
  trustHost: true,
  providers: [
    Email({
      id: "email", // needed to allow signIn("email")
      name: "Email", // Changes text on default sign in button
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.roles = user.roles;
      }
      return Promise.resolve(token);
    },
    async session({ session, token }) {
      const result = {
        ...session,
        id: token.id as string | undefined,
        email: token.email as string | undefined,
        name: token.name as string | undefined,
        roles: token.roles as
          | { orgId: number; orgName: string; roleName: UserRole }[]
          | undefined,
      };
      return Promise.resolve(result);
    },
  },
});
