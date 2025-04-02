import { env } from "@acme/env";

export const isDevMode = env.NEXT_PUBLIC_CHANNEL !== "prod";
export const isTestMode = env.NODE_ENV === "test";
