import { useMemo } from "react";
import { Controller } from "react-hook-form";

import { isTruthy } from "@acme/shared/common/functions";

import { api } from "~/trpc/react";
import { useUpdateFormContext } from "~/utils/forms";
import { VirtualizedCombobox } from "../../virtualized-combobox";

export const ExistingLocationPickerForm = () => {
  const form = useUpdateFormContext();
  const formRegionId = form.watch("regionId");
  const formOriginalRegionId = form.watch("originalRegionId");
  const changingRegions =
    !!formOriginalRegionId && formOriginalRegionId !== formRegionId;

  // Get location data
  const { data: locations } = api.location.all.useQuery();

  const sortedRegionLocationOptions = useMemo(() => {
    return (
      locations?.locations
        // If we have an original regionId, only show those, otherwise use the formRegionId
        ?.filter((l) =>
          formOriginalRegionId
            ? l.regionId === formOriginalRegionId
            : l.regionId === formRegionId,
        )
        ?.sort((a, b) =>
          a.regionId === formRegionId && b.regionId !== formRegionId
            ? -1
            : a.regionId !== formRegionId && b.regionId === formRegionId
              ? 1
              : a.locationName.localeCompare(b.locationName),
        )
        ?.map((l) => ({
          labelComponent: (
            <span>
              {`${l.locationName}${l.regionName ? ` (${l.regionName})` : ""}`}
              <span className="text-foreground/30">{` ${[l.addressStreet, l.addressStreet2, l.addressCity, l.addressState, l.addressZip, l.addressCountry].filter(isTruthy).join(", ")}`}</span>
            </span>
          ),
          label: `${l.locationName}${l.regionName ? ` (${l.regionName})` : ""} ${[l.addressStreet, l.addressStreet2, l.addressCity, l.addressState, l.addressZip, l.addressCountry].filter(isTruthy).join(", ")}`,
          value: l.id.toString(),
          regionId: l.regionId,
        }))
    );
  }, [locations?.locations, formOriginalRegionId, formRegionId]);

  return (
    <>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        Select Destination Location:
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location
          </div>
          <Controller
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <div>
                <VirtualizedCombobox
                  disabled={changingRegions}
                  options={sortedRegionLocationOptions ?? []}
                  value={field.value?.toString()}
                  onSelect={(value) => {
                    field.onChange(Number(value));
                  }}
                  searchPlaceholder="Select destination location"
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationId?.message?.toString()}
                </p>
              </div>
            )}
          />
        </div>
      </div>
    </>
  );
};
