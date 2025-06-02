import { Controller } from "react-hook-form";

import { dayOfWeekToShortDayOfWeek } from "@acme/shared/app/functions";

import { api } from "~/trpc/react";
import { useUpdateFormContext } from "~/utils/forms";
import { useOptions } from "~/utils/use-options";
import { VirtualizedCombobox } from "../../virtualized-combobox";

export const EventSelectionForm = () => {
  const form = useUpdateFormContext();
  const formRegionId = form.watch("regionId");
  const formAOId = form.watch("aoId");

  const { data: regions } = api.location.getRegions.useQuery();

  const { data: events } = api.event.all.useQuery(
    {
      ...(formAOId ? { aoIds: [formAOId] } : {}),
      ...(formRegionId ? { regionIds: [formRegionId] } : {}),
    },
    {
      enabled: formRegionId != null,
    },
  );

  const { data: aos } = api.org.all.useQuery(
    {
      orgTypes: ["ao"],
      parentOrgIds: formRegionId ? [formRegionId] : undefined,
      pageSize: 200,
    },
    { enabled: formRegionId != null },
  );

  const regionOptions = useOptions(
    regions,
    (r) => r.name,
    (r) => r.id.toString(),
  );
  const aoOptions = useOptions(
    aos?.orgs,
    (ao) => `${ao.name} (${ao.parentOrgName})`,
    (ao) => ao.id.toString(),
  );

  const eventOptions = useOptions(
    events?.events,
    (e) =>
      e.dayOfWeek
        ? `${e.name} (${dayOfWeekToShortDayOfWeek(e.dayOfWeek)})`
        : e.name,
    (e) => e.id.toString(),
  );

  return (
    <>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        Choose Event:
      </h2>
      <div className="flex flex-row flex-wrap gap-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-muted-foreground">
            In Region:
          </div>
          <Controller
            control={form.control}
            name="regionId"
            render={({ field, fieldState }) => (
              <>
                <VirtualizedCombobox
                  key={field.value?.toString()}
                  options={regionOptions}
                  value={field.value?.toString()}
                  onSelect={(item) => {
                    const region = regions?.find(
                      (region) => region.id.toString() === item,
                    );
                    // @ts-expect-error - need to unset regionId despite zod
                    form.setValue("regionId", region?.id ?? (null as number));
                  }}
                  searchPlaceholder="Select Region"
                />
                <p className="text-xs text-destructive">
                  {fieldState.error?.message?.toString()}
                </p>
              </>
            )}
          />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-muted-foreground">
            From AO (optional):
          </div>
          <Controller
            control={form.control}
            name="aoId"
            render={({ field, fieldState }) => (
              <>
                <VirtualizedCombobox
                  key={formRegionId?.toString()}
                  options={aoOptions}
                  value={field.value?.toString()}
                  onSelect={(item) => {
                    const ao = aos?.orgs?.find(
                      (ao) => ao.id.toString() === item,
                    );
                    field.onChange(ao?.id);
                  }}
                  searchPlaceholder="Select AO"
                />
                <p className="text-xs text-destructive">
                  {fieldState.error?.message?.toString()}
                </p>
              </>
            )}
          />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-muted-foreground">
            Event to move:
          </div>
          <Controller
            control={form.control}
            name="eventId"
            render={({ field, fieldState }) => (
              <>
                <VirtualizedCombobox
                  key={formRegionId?.toString()}
                  options={eventOptions}
                  value={field.value?.toString()}
                  onSelect={(item) => {
                    const event = events?.events?.find(
                      (event) => event.id.toString() === item,
                    );
                    field.onChange(event?.id);
                  }}
                  searchPlaceholder="Select Event"
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
