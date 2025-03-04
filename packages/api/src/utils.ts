import { env } from "@acme/env";

export const isDevMode = env.NEXT_PUBLIC_CHANNEL !== "prod";
