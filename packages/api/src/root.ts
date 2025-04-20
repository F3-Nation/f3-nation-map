import { aoRouter } from "./router/ao";
import { areaRouter } from "./router/area";
import { authRouter } from "./router/auth";
import { eventRouter } from "./router/event";
import { feedbackRouter } from "./router/feedback";
import { locationRouter } from "./router/location";
import { nationRouter } from "./router/nation";
import { pingRouter } from "./router/ping";
import { regionRouter } from "./router/region";
import { requestRouter } from "./router/request";
import { sectorRouter } from "./router/sector";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  ao: aoRouter,
  area: areaRouter,
  feedback: feedbackRouter,
  ping: pingRouter,
  location: locationRouter,
  user: userRouter,
  request: requestRouter,
  event: eventRouter,
  region: regionRouter,
  sector: sectorRouter,
  nation: nationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
