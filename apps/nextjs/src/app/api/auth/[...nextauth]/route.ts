import type { NextRequest } from "next/server";

import { handlers } from "@acme/auth";

type Action = "callback" | "signin" | "session";
type Provider = "email-password" | "credentials";

export const POST = async (
  req: NextRequest,
  props: { params: { nextauth: [Action, Provider] } },
) => {
  console.log("POST", props.params.nextauth);
  return handlers.POST(req);
};

export const GET = async (
  req: NextRequest,
  props: { params: { nextauth: [Action, Provider] } },
) => {
  console.log("GET", props.params.nextauth);
  return handlers.GET(req);
};
