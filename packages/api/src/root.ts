import { authRouter } from "./router/auth";
import { feedbackRouter } from "./router/feedback";
import { locationRouter } from "./router/location";
import { pingRouter } from "./router/ping";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  feedback: feedbackRouter,
  ping: pingRouter,
  location: locationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
