import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Email from "next-auth/providers/nodemailer";

import type { UserRole } from "@acme/shared/app/enums";
import { db } from "@acme/db/client";
import { orgs } from "@acme/db/schema/schema";
import { env } from "@acme/env";
import { normalizeEmail } from "@acme/shared/common/functions";

import { MDPGDrizzleAdapter } from "./MDPgDrizzleAdapter";
import { sendVerificationRequest } from "./utils";

export type { Session } from "next-auth";

const isProd = env.NEXT_PUBLIC_CHANNEL === "prod";

const emailProvider = Email({
  id: "email", // needed to allow signIn("email")
  name: "Email", // Changes text on default sign in button
  server: env.EMAIL_SERVER,
  from: env.EMAIL_FROM,
  sendVerificationRequest,
  normalizeIdentifier: normalizeEmail,
});

// Needed for auth util operations
export const localEmailProvider = {
  ...emailProvider,
  ...emailProvider.options,
};

const providers: Provider[] = [emailProvider];

if (!isProd) {
  providers.push(
    CredentialsProvider({
      id: "dev-mode",
      name: "Development Mode",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (isProd) return null;

        const [f3Nation] = await db
          .select()
          .from(orgs)
          .where(eq(orgs.orgType, "nation"));
        if (!f3Nation) return null;

        // Return a mock user for development
        return {
          id: "1",
          email: credentials.email as string,
          name: "Dev User",
          roles: [
            {
              orgId: f3Nation.id,
              orgName: f3Nation.name,
              roleName: "admin",
            },
          ],
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Must cast since we use number for user ids
  // And next-auth expects string for user ids
  // And it is a nightmare (impossible?) to overwrite the type
  adapter: MDPGDrizzleAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  // Needed to run on cloud build docker deployment (basePath and trustHost)
  // https://github.com/nextauthjs/next-auth/issues/9819#issuecomment-1912903196
  basePath: "/api/auth",
  trustHost: true,
  pages: {
    signIn: "/auth/sign-in",
    verifyRequest: "/auth/verify-request",
    signOut: "/auth/sign-out",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name;
        token.roles = user.roles;
      }

      if (trigger === "update" && session && "roles" in session) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        token.roles = session.roles;
      }

      return Promise.resolve(token);
    },
    async session({ session, token }) {
      const result = {
        ...session,
        id: token.id as string | undefined,
        email: token.email,
        name: token.name as string | undefined,
        roles: token.roles as
          | { orgId: number; orgName: string; roleName: UserRole }[]
          | undefined,
      };
      return Promise.resolve(result);
    },
  },
});
