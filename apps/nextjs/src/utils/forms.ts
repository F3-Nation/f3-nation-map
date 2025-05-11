import type { z as zType } from "zod";
import { z } from "zod";

import { ShadCNFormFactory } from "@acme/ui/form";
import { RequestInsertSchema } from "@acme/validators";

const UpdateLocationFormSchema = RequestInsertSchema.extend({
  badImage: z.boolean().default(false),
  eventStartTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Start time must be in 24hr format (HH:mm)",
  }),
  eventEndTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "End time must be in 24hr format (HH:mm)",
  }),
  // Need originals to prevent changes in some scenarios (e.g. changing region)
  originalRegionId: z.number().nullable(),
  originalAoId: z.number().nullable(),
  originalLocationId: z.number().nullable(),
});

export type UpdateLocationFormValues = zType.infer<
  typeof UpdateLocationFormSchema
>;

export const {
  useSchemaForm: useUpdateForm,
  useSchemaFormContext: useUpdateFormContext,
} = ShadCNFormFactory(UpdateLocationFormSchema);

export const DeleteFormSchema = RequestInsertSchema.pick({
  id: true,
  requestType: true,
  eventId: true,
  aoId: true,
  locationId: true,
  regionId: true,
  submittedBy: true,
});

export type DeleteFormValues = zType.infer<typeof DeleteFormSchema>;

export const {
  useSchemaForm: useDeleteForm,
  useSchemaFormContext: useDeleteFormContext,
} = ShadCNFormFactory(DeleteFormSchema);
