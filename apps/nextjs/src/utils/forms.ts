import { z } from "zod";

import { ShadCNFormFactory } from "@acme/ui/form";
import { RequestInsertSchema } from "@acme/validators";

export const {
  useSchemaForm: useUpdateLocationForm,
  useSchemaFormContext: useUpdateLocationFormContext,
} = ShadCNFormFactory(
  RequestInsertSchema.extend({
    badImage: z.boolean().default(false),
  }),
);
