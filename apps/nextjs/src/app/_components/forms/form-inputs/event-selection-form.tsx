import { Controller } from "react-hook-form";

import { api } from "~/trpc/react";
import { useUpdateFormContext } from "~/utils/forms";
import { VirtualizedCombobox } from "../../virtualized-combobox";

export const EventSelectionForm = () => {
  const form = useUpdateFormContext();
  const formRegionId = form.watch("regionId");

  // Get regions data
  const { data: events } = api.event.all.useQuery({
    regionIds: formRegionId ? [formRegionId] : [],
  });

  return (
    <>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        Existing Event:
      </h2>
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Region</div>
        <div className="mb-3">
          <Controller
            control={form.control}
            name="eventId"
            render={({ field, fieldState }) => (
              <>
                <VirtualizedCombobox
                  key={formRegionId?.toString()}
                  options={
                    events?.events
                      ?.map((region) => ({
                        label: region.name,
                        value: region.id.toString(),
                      }))
                      .sort((a, b) => a.label.localeCompare(b.label)) ?? []
                  }
                  value={field.value?.toString()}
                  onSelect={(item) => {
                    const event = events?.events?.find(
                      (event) => event.id.toString() === item,
                    );
                    if (event) {
                      field.onChange(event.id);
                    }
                  }}
                  searchPlaceholder="Select"
                />
                <p className="text-xs text-destructive">
                  {fieldState.error?.message?.toString()}
                </p>
              </>
            )}
          />
        </div>
      </div>
    </>
  );
};
