import type { z as zType } from "zod";

import { ShadCNFormFactory } from "@acme/ui/form";
import {
  DeleteRequestSchema,
  UpdateLocationFormSchema,
} from "@acme/validators";

export const {
  useSchemaForm: useUpdateForm,
  useSchemaFormContext: useUpdateFormContext,
} = ShadCNFormFactory(UpdateLocationFormSchema);

export const DeleteFormSchema = DeleteRequestSchema;

export type DeleteFormValues = zType.infer<typeof DeleteFormSchema>;

export const {
  useSchemaForm: useDeleteForm,
  useSchemaFormContext: useDeleteFormContext,
} = ShadCNFormFactory(DeleteFormSchema);
