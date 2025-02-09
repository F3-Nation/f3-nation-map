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
        token.role = "role" in user ? user.role : "user";
        token.name = user.name;
      }
      return Promise.resolve(token);
    },
    async session({ session, token }) {
      const result = {
        ...session,
        id: token.id as string | undefined,
        role: token.role as UserRole | undefined,
        email: token.email as string | undefined,
        name: token.name as string | undefined,
      };
      return Promise.resolve(result);
    },
  },
});
