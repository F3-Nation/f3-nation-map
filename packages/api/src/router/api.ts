import { revalidatePath } from "next/cache";
import { z } from "zod";

import { notifyWebhooks } from "../lib/notify-webhooks";
import { apiKeyProcedure, createTRPCRouter } from "../trpc";

export const apiRouter = createTRPCRouter({
  revalidate: apiKeyProcedure
    .input(
      z
        .object({
          eventId: z.number().optional(),
          locationId: z.number().optional(),
          orgId: z.number().optional(),
          action: z.enum(["map.updated", "map.created", "map.deleted"]),
        })
        .optional(),
    )
    .mutation(async ({ input }) => {
      revalidatePath("/");
      if (input) {
        await notifyWebhooks(input);
      }
      return { success: true };
    }),
});
