import { Controller } from "react-hook-form";

import { Input } from "@acme/ui/input";

import { useUpdateFormContext } from "~/utils/forms";
import { DebouncedImage } from "../../debounced-image";

export const AoDetailsForm = () => {
  const form = useUpdateFormContext();
  return (
    <>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        AO Details:
      </h2>

      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">AO Name</div>
        <Input {...form.register("aoName")} />
        <p className="text-xs text-destructive">
          {form.formState.errors.aoName?.message?.toString()}
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          AO Website
        </div>
        <Input {...form.register("aoWebsite")} placeholder="https://" />
        <p className="text-xs text-destructive">
          {form.formState.errors.aoWebsite?.message?.toString()}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            AO Logo URL
          </div>
          <Input
            {...form.register("aoLogo")}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div className="my-2">
        <Controller
          control={form.control}
          name="aoLogo"
          render={({ field }) => (
            <div className="flex flex-col items-center">
              <DebouncedImage
                className="max-h-24 rounded-sm object-contain"
                src={field.value ?? ""}
                width={96}
                height={96}
                alt="Logo Preview"
                onImageFail={() => {
                  form.setValue("badImage", true);
                }}
                onImageSuccess={() => {
                  form.setValue("badImage", false);
                }}
              />
            </div>
          )}
        />
      </div>
    </>
  );
};
