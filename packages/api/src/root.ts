import { authRouter } from "./router/auth";
import { defaultRouter } from "./router/default";
import { locationRouter } from "./router/location";
import { pingRouter } from "./router/ping";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  ping: pingRouter,
  location: locationRouter,
  ...defaultRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
