import { env } from "@f3/env";

export const isDevMode = env.NEXT_PUBLIC_CHANNEL !== "prod";
