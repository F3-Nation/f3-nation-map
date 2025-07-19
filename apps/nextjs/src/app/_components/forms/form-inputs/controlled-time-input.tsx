import type { FieldPath } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { UpdateLocationFormValues } from "@acme/validators";
import { FormControl, FormItem, FormLabel, FormMessage } from "@acme/ui/form";
import { Input } from "@acme/ui/input";

import { useUpdateFormContext } from "~/utils/forms";

interface TimeInputProps {
  name: FieldPath<UpdateLocationFormValues>;
  id?: string;
  label: string;
}

export const ControlledTimeInput = ({ name, id, label }: TimeInputProps) => {
  const form = useUpdateFormContext();

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="time"
              id={id}
              value={typeof field.value === "string" ? field.value : ""}
              onChange={field.onChange}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
