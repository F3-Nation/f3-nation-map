import { authRouter } from "./router/auth";
import { expansionUsersRouter } from "./router/expansionUsers";
import { locationRouter } from "./router/location";
import { pingRouter } from "./router/ping";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  ping: pingRouter,
  location: locationRouter,
  expansionUsers: expansionUsersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
