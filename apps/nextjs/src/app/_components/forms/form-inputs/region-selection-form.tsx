import { useMemo } from "react";
import { Controller } from "react-hook-form";

import { api } from "~/trpc/react";
import { useUpdateFormContext } from "~/utils/forms";
import { VirtualizedCombobox } from "../../virtualized-combobox";

export const RegionSelectionForm = () => {
  const form = useUpdateFormContext();

  // Get regions data
  const { data: regions } = api.location.getRegions.useQuery();

  const options = useMemo(() => {
    return (
      regions
        ?.map((region) => ({
          label: region.name,
          value: region.id.toString(),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? []
    );
  }, [regions]);
  return (
    <>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        Region Details:
      </h2>
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Region</div>
        <div className="mb-3">
          <Controller
            control={form.control}
            name="regionId"
            render={({ field, fieldState }) => (
              <>
                <VirtualizedCombobox
                  key={field.value?.toString()}
                  options={options}
                  value={field.value?.toString()}
                  onSelect={(item) => {
                    const region = regions?.find(
                      (region) => region.id.toString() === item,
                    );
                    if (region) {
                      form.setValue("regionId", region.id);
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
