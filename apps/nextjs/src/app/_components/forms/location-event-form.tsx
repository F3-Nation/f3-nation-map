import { useMemo } from "react";
import lt from "lodash/lt";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { DayOfWeek } from "@acme/shared/app/enums";
import { Case } from "@acme/shared/common/enums";
import { convertCase } from "@acme/shared/common/functions";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import {
  ControlledSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import { RequestInsertSchema } from "@acme/validators";

import { api } from "~/trpc/react";
import { useUpdateLocationFormContext } from "~/utils/forms";
import { scaleAndCropImage } from "~/utils/image/scale-and-crop-image";
import { uploadLogo } from "~/utils/image/upload-logo";
import { mapStore } from "~/utils/store/map";
import { DebouncedImage } from "../debounced-image";
import { CountrySelect } from "../modal/country-select";
import { TimeInput } from "../time-input";
import { VirtualizedCombobox } from "../virtualized-combobox";

export const UpdateLocationSchema = RequestInsertSchema.extend({
  badImage: z.boolean().default(false),
});

type UpdateLocationSchema = z.infer<typeof UpdateLocationSchema>;

export const LocationEventForm = ({
  isAdminForm = false,
}: {
  isAdminForm?: boolean;
}) => {
  const form = useUpdateLocationFormContext();
  const formId = form.watch("id");
  const formRegionId = form.watch("regionId");
  const formLocationId = form.watch("locationId");

  // Get form values
  const { data: regions } = api.location.getRegions.useQuery();
  const { data: locations } = api.location.all.useQuery();
  const { data: eventTypes } = api.event.types.useQuery();

  const sortedLocationOptions = useMemo(() => {
    return locations?.locations
      ?.map(({ locationName, aoName, id, regionName, regionId }) => ({
        label: `${locationName || aoName} ${regionName ? `(${regionName})` : ""}`,
        value: id.toString(),
        regionId,
      }))
      ?.sort((a, b) =>
        a.regionId === formRegionId && b.regionId !== formRegionId
          ? -1
          : a.regionId !== formRegionId && b.regionId === formRegionId
            ? 1
            : a.label.localeCompare(b.label),
      );
  }, [locations, formRegionId]);

  return (
    <>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        Event Details:
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Workout Name
          </div>
          <Input {...form.register("eventName")} />
          <p className="text-xs text-destructive">
            {form.formState.errors.eventName?.message}
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Day of Week
          </div>
          <ControlledSelect
            control={form.control}
            name="eventDayOfWeek"
            options={DayOfWeek.map((day) => ({
              value: day,
              label: convertCase({
                str: day,
                fromCase: Case.LowerCase,
                toCase: Case.TitleCase,
              }),
            }))}
            placeholder="Select a day of the week"
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.eventDayOfWeek?.message}
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Start Time (24hr format)
          </div>
          <Controller
            control={form.control}
            name="eventStartTime"
            render={({ field }) => (
              <TimeInput
                placeholder="HH:mm"
                {...field}
                value={
                  field.value
                    ? `${field.value.slice(0, 2)}:${field.value.slice(2)}`
                    : ""
                }
                onChange={(value) => {
                  if (value) {
                    const [hours, minutes] = value.split(":");
                    field.onChange(`${hours}${minutes}`);
                  } else {
                    field.onChange("");
                  }
                }}
              />
            )}
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.eventStartTime?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            End Time (24hr format)
          </div>
          <Controller
            control={form.control}
            name="eventEndTime"
            render={({ field }) => (
              <TimeInput
                placeholder="HH:mm"
                {...field}
                value={
                  field.value
                    ? `${field.value.slice(0, 2)}:${field.value.slice(2)}`
                    : ""
                }
                onChange={(value) => {
                  if (value) {
                    const [hours, minutes] = value.split(":");
                    field.onChange(`${hours}${minutes}`);
                  } else {
                    field.onChange("");
                  }
                }}
              />
            )}
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.eventEndTime?.message}
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Event Type
          </div>
          <Controller
            control={form.control}
            name="eventTypeIds"
            render={({ field, fieldState }) => {
              return (
                <div>
                  <Select
                    value={field.value?.[0]?.toString()}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(
                          eventTypes
                            ?.filter((type) => type.id.toString() === value)
                            .map((type) => type.id),
                        );
                      }
                    }}
                  >
                    <SelectTrigger id={`eventTypes`} aria-label="Event Type">
                      <SelectValue placeholder="Select an event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-xs text-destructive">
                      You must select at least one event type
                    </p>
                  )}
                </div>
              );
            }}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="text-sm font-medium text-muted-foreground">
            Event Description
          </div>
          <Textarea
            {...form.register("eventDescription")}
            placeholder="Tell people if there's anything they need to know prior to showing up to the workout"
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.eventDescription?.message}
          </p>
        </div>
      </div>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        Location Details:
      </h2>
      <div className="text-sm font-medium text-muted-foreground">
        Existing Location / AO (Region)
      </div>
      <div className="mb-3">
        <VirtualizedCombobox
          key={formLocationId?.toString()}
          options={sortedLocationOptions ?? []}
          value={formLocationId?.toString()}
          onSelect={(item) => {
            const location = locations?.locations.find(
              ({ id }) => id.toString() === item,
            );
            form.setValue("locationId", location?.id ?? null);
            if (!location) return;

            // Handle different property names between components

            form.setValue(
              "aoName",
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- avoid ""
              location.aoName || location.locationName || "",
            );
            form.setValue("locationDescription", location.description ?? "");
            form.setValue("locationAddress", location.addressStreet);
            form.setValue("locationAddress2", location.addressStreet2);
            form.setValue("locationCity", location.addressCity);
            form.setValue("locationState", location.addressState);
            form.setValue("locationZip", location.addressZip);
            form.setValue("locationCountry", location.addressCountry);

            // We need to keep the lat lng when the marker has been moved
            if (!isAdminForm) {
              const possiblyUpdatedLocation = mapStore.get(
                "modifiedLocationMarkers",
              )[location.id];
              form.setValue(
                "locationLat",
                possiblyUpdatedLocation?.lat ?? location.latitude,
              );
              form.setValue(
                "locationLng",
                possiblyUpdatedLocation?.lon ?? location.longitude,
              );
            } else {
              form.setValue("locationLat", location.latitude);
              form.setValue("locationLng", location.longitude);
            }

            if (location?.regionId == undefined) {
              // @ts-expect-error -- must remove regionId from form
              form.setValue("regionId", null);
            } else {
              form.setValue("regionId", location?.regionId);
            }
          }}
          searchPlaceholder="Select"
        />
        <div className="mx-3 text-xs text-muted-foreground">
          Select a location above to move this workout to a different location
          (AO)
        </div>
      </div>
      <div className="my-2 text-base font-bold text-foreground">
        The fields below update the location / AO for all associated workouts
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location Region
          </div>
          <VirtualizedCombobox
            key={formRegionId?.toString()}
            options={
              regions
                ?.map((region) => ({
                  label: region.name,
                  value: region.id.toString(),
                }))
                .sort((a, b) => a.label.localeCompare(b.label)) ?? []
            }
            value={formRegionId?.toString()}
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
            {form.formState.errors.regionId?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location / AO Name
          </div>
          <Input {...form.register("aoName")} />
          <p className="text-xs text-destructive">
            {form.formState.errors.aoName?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location Description
          </div>
          <Textarea
            {...form.register("locationDescription")}
            placeholder="Help people unfamiliar with the area find you"
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.locationDescription?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location Address
          </div>
          <Input {...form.register("locationAddress")} />
          <p className="text-xs text-destructive">
            {form.formState.errors.locationAddress?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location Address 2
          </div>
          <Input {...form.register("locationAddress2")} />
          <p className="text-xs text-destructive">
            {form.formState.errors.locationAddress2?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location City
          </div>
          <Input {...form.register("locationCity")} />
          <p className="text-xs text-destructive">
            {form.formState.errors.locationCity?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location State
          </div>
          <Input {...form.register("locationState")} />
          <p className="text-xs text-destructive">
            {form.formState.errors.locationState?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location Zip
          </div>
          <Input {...form.register("locationZip")} />
          <p className="text-xs text-destructive">
            {form.formState.errors.locationZip?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location Country
          </div>
          <CountrySelect control={form.control} name="locationCountry" />
          <p className="text-xs text-destructive">
            {form.formState.errors.locationCountry?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location Latitude
          </div>
          <Input {...form.register("locationLat", { valueAsNumber: true })} />
          <p className="text-xs text-destructive">
            {form.formState.errors.locationLat?.message?.toString?.()}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Location Longitude
          </div>
          <Input {...form.register("locationLng", { valueAsNumber: true })} />
          <p className="text-xs text-destructive">
            {form.formState.errors.locationLng?.message?.toString?.()}
          </p>
        </div>
      </div>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        Other Details:
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            AO Logo
          </div>
          <Controller
            control={form.control}
            name="aoLogo"
            render={({ field: { onChange, value } }) => {
              return (
                <div className="flex flex-col items-center gap-2 min-[320px]:flex-row">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (formRegionId == null) {
                        toast.error("Please select a region first");
                        return;
                      }
                      console.log("files", e.target.files);
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const blob640 = await scaleAndCropImage(file, 640, 640);
                      if (!blob640) return;
                      const url640 = await uploadLogo({
                        file: blob640,
                        regionId: formRegionId,
                        requestId: formId,
                      });
                      onChange(url640);
                      const blob64 = await scaleAndCropImage(file, 64, 64);
                      if (blob64) {
                        await uploadLogo({
                          file: blob64,
                          regionId: formRegionId,
                          requestId: formId,
                          size: 64,
                        });
                      }
                    }}
                    disabled={lt(formRegionId, 0)}
                    className="flex-1"
                  />
                  {value && (
                    <DebouncedImage
                      src={value}
                      alt="AO Logo"
                      onImageFail={() => form.setValue("badImage", true)}
                      onImageSuccess={() => form.setValue("badImage", false)}
                    />
                  )}
                </div>
              );
            }}
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.aoLogo?.message}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Submitter Email
          </div>
          <Input {...form.register("submittedBy")} disabled={isAdminForm} />
          <p className="text-xs text-destructive">
            {form.formState.errors.submittedBy?.message}
          </p>
        </div>
      </div>
    </>
  );
};

export const DevLoadTestData = () => {
  const form = useUpdateLocationFormContext();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        const values = form.getValues();
        !values.eventName && form.setValue("eventName", "Test Event");
        !values.eventDayOfWeek && form.setValue("eventDayOfWeek", "monday");
        !values.submittedBy && form.setValue("submittedBy", "test@test.com");
        !values.aoLogo &&
          form.setValue("aoLogo", "https://placehold.co/640x640");
        !values.aoName && form.setValue("aoName", "Test AO");
        !values.locationAddress &&
          form.setValue("locationAddress", "123 Test St");
        !values.locationAddress2 && form.setValue("locationAddress2", "Apt 1");
        !values.locationCity && form.setValue("locationCity", "Test City");
        !values.locationState && form.setValue("locationState", "CA");
        !values.locationZip && form.setValue("locationZip", "12345");
        !values.locationCountry &&
          form.setValue("locationCountry", "United States");
        !values.eventTypeIds?.length && form.setValue("eventTypeIds", [1]);
        !values.eventStartTime && form.setValue("eventStartTime", "0900");
        !values.eventEndTime && form.setValue("eventEndTime", "1000");
        !values.eventDescription &&
          form.setValue("eventDescription", "Test Description");
      }}
    >
      (DEV) Load Test Data
    </Button>
  );
};

export const FormDebugData = () => {
  const form = useUpdateLocationFormContext();
  const formId = form.watch("id");
  const formRegionId = form.watch("regionId");
  const formLocationId = form.watch("locationId");
  const formEventId = form.watch("eventId");
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">formId: {formId};</p>
      <p className="text-sm text-muted-foreground">regionId: {formRegionId};</p>
      <p className="text-sm text-muted-foreground">
        locationId: {formLocationId};
      </p>
      <p className="text-sm text-muted-foreground">eventId: {formEventId}</p>
    </div>
  );
};
