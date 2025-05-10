import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import type { RequestType } from "@acme/shared/app/enums";
import { DayOfWeek } from "@acme/shared/app/enums";
import { Case } from "@acme/shared/common/enums";
import { convertCase, isTruthy } from "@acme/shared/common/functions";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { MultiSelect } from "@acme/ui/multi-select";
import { ControlledSelect } from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import { RequestInsertSchema } from "@acme/validators";

import { api } from "~/trpc/react";
import { useUpdateLocationFormContext } from "~/utils/forms";
import { DebouncedImage } from "../debounced-image";
import { CountrySelect } from "../modal/country-select";
import { ControlledTimeInput } from "../time-input";
import { VirtualizedCombobox } from "../virtualized-combobox";

export const UpdateLocationSchema = RequestInsertSchema.extend({
  badImage: z.boolean().default(false),
});

type UpdateLocationSchema = z.infer<typeof UpdateLocationSchema>;

export const LocationEventForm = ({
  isAdminForm = false,
  requestType,
}: {
  isAdminForm?: boolean;
  requestType: RequestType;
}) => {
  const form = useUpdateLocationFormContext();
  const formId = form.watch("id");
  const formRegionId = form.watch("regionId");
  const formOriginalRegionId = form.watch("originalRegionId");
  const formLocationId = form.watch("locationId");
  const formOriginalLocationId = form.watch("originalLocationId");
  const formAoId = form.watch("aoId");
  const formOriginalAoId = form.watch("originalAoId");

  // Get form values
  const { data: regions } = api.location.getRegions.useQuery();
  const { data: allAoData } = api.org.all.useQuery({ orgTypes: ["ao"] });
  const { data: locations } = api.location.all.useQuery();
  const { data: eventTypes } = api.eventType.all.useQuery({
    orgIds: formRegionId ? [formRegionId] : [],
  });
  const aos = useMemo(() => allAoData?.orgs, [allAoData]);

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

  const sortedRegionAoOptions = useMemo(() => {
    return (
      aos
        // If we have an original regionId, only show those, otherwise use the formRegionId
        ?.filter((a) =>
          formOriginalRegionId
            ? a.parentId === formOriginalRegionId
            : a.parentId === formRegionId,
        )
        ?.map((ao) => ({
          label: `${ao.name} (${ao.parentOrgName})`,
          value: ao.id.toString(),
        }))
        ?.sort((a, b) => a.label.localeCompare(b.label)) ?? []
    );
  }, [aos, formOriginalRegionId, formRegionId]);

  const changingRegions =
    !!formOriginalRegionId && formOriginalRegionId !== formRegionId;

  const changingLocations =
    !!formOriginalLocationId && formOriginalLocationId !== formLocationId;

  const changingAos = !!formOriginalAoId && formOriginalAoId !== formAoId;

  // Determine which sections to show based on requestType
  const showEventSection =
    requestType === "create_location" ||
    requestType === "create_event" ||
    requestType === "edit" ||
    requestType === "move_event_to_different_ao" ||
    requestType === "move_event_to_new_ao";

  const showLocationSection =
    requestType === "create_location" ||
    requestType === "move_ao_to_new_location" ||
    requestType === "move_event_to_new_ao" ||
    requestType === "edit";

  const showAoSection =
    requestType === "create_location" ||
    requestType === "edit" ||
    requestType === "move_ao_to_different_region" ||
    requestType === "move_ao_to_new_location";

  const showExistingAoPicker = requestType === "move_event_to_different_ao";

  const showExistingLocationPicker =
    requestType === "move_ao_to_different_location";

  const showDeleteConfirmation =
    requestType === "delete_event" || requestType === "delete_ao";

  return (
    <>
      {/* Event Section */}
      {showEventSection && (
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
              <ControlledTimeInput
                control={form.control}
                name="eventStartTime"
                id={"eventStartTime"}
                label={"Start Time"}
              />
            </div>
            <div className="space-y-2">
              <ControlledTimeInput
                control={form.control}
                name="eventEndTime"
                id={"eventEndTime"}
                label={"End Time"}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Event Types
              </div>
              <Controller
                control={form.control}
                name="eventTypeIds"
                render={({ field, fieldState }) => {
                  return (
                    <div>
                      <MultiSelect
                        hideSelectAll
                        defaultValue={(field.value ?? []).map(String)}
                        value={(field.value ?? []).map(String)}
                        options={
                          eventTypes?.eventTypes.map((type) => ({
                            label: type.name,
                            value: type.id.toString(),
                          })) ?? []
                        }
                        onValueChange={(values) =>
                          field.onChange(values.map(Number))
                        }
                        placeholder="Select event types"
                      />
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

            <div className="mx-2 space-y-2 sm:col-span-2">
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
        </>
      )}

      {/* Moving Event to Different AO section */}
      {showExistingAoPicker && (
        <>
          <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
            Select Destination AO:
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                AO Location
              </div>
              <Controller
                control={form.control}
                name="aoId"
                render={({ field }) => (
                  <div>
                    <VirtualizedCombobox
                      disabled={changingRegions}
                      options={sortedRegionAoOptions ?? []}
                      value={field.value?.toString()}
                      onSelect={(value) => {
                        field.onChange(Number(value));
                      }}
                      searchPlaceholder="Select destination AO"
                    />
                    <p className="text-xs text-destructive">
                      {form.formState.errors.aoId?.message}
                    </p>
                  </div>
                )}
              />
            </div>
          </div>
        </>
      )}

      {/* Moving AO to Different Location section */}
      {showExistingLocationPicker && (
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
                      {form.formState.errors.locationId?.message}
                    </p>
                  </div>
                )}
              />
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation section */}
      {showDeleteConfirmation && (
        <>
          <div className="my-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Attention Required
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {requestType === "delete_event" ? (
                    <p>
                      You are about to request deletion of an event. This action
                      cannot be undone. Please confirm you want to proceed with
                      this deletion request.
                    </p>
                  ) : (
                    <p>
                      You are about to request deletion of an AO. This will
                      delete the AO, all its workouts, and possibly the location
                      if no other events exist there. This action cannot be
                      undone. Please confirm you want to proceed with this
                      deletion request.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Region/AO Section */}
      {showAoSection && (
        <>
          <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
            AO & Region Details:
          </h2>

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Region
            </div>
            <div className="mb-3">
              <VirtualizedCombobox
                key={formRegionId?.toString()}
                disabled={changingLocations}
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
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              AO Name
            </div>
            <Input {...form.register("aoName")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.aoName?.message}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              AO Website
            </div>
            <Input {...form.register("aoWebsite")} placeholder="https://" />
            <p className="text-xs text-destructive">
              {form.formState.errors.aoWebsite?.message}
            </p>
          </div>

          {!isAdminForm && (
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
          )}

          <div className="my-2">
            <Controller
              control={form.control}
              name="aoLogo"
              render={({ field }) => {
                return (
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
                );
              }}
            />
          </div>
        </>
      )}

      {/* Physical Location Section */}
      {showLocationSection && (
        <>
          <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
            Physical Location Details:
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Street Address
              </div>
              <Input {...form.register("locationAddress")} />
              <p className="text-xs text-destructive">
                {form.formState.errors.locationAddress?.message}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Address Line 2
              </div>
              <Input {...form.register("locationAddress2")} />
              <p className="text-xs text-destructive">
                {form.formState.errors.locationAddress2?.message}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                City
              </div>
              <Input {...form.register("locationCity")} />
              <p className="text-xs text-destructive">
                {form.formState.errors.locationCity?.message}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                State/Province
              </div>
              <Input {...form.register("locationState")} />
              <p className="text-xs text-destructive">
                {form.formState.errors.locationState?.message}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                ZIP / Postal Code
              </div>
              <Input {...form.register("locationZip")} />
              <p className="text-xs text-destructive">
                {form.formState.errors.locationZip?.message}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Country
              </div>
              <Controller
                control={form.control}
                name="locationCountry"
                render={({ field }) => {
                  return (
                    <CountrySelect
                      control={form.control}
                      name="locationCountry"
                      disabled={false}
                      placeholder="Select a country"
                    />
                  );
                }}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.locationCountry?.message}
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="text-sm font-medium text-muted-foreground">
                Location Description
              </div>
              <Textarea
                {...form.register("locationDescription")}
                placeholder="Provide additional details about the meet-up location (e.g. 'Meet at the south entrance', 'The corner of Main and Oak St')"
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.locationDescription?.message}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Contact information for all forms */}
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        Contact Information:
      </h2>
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Your Email
        </div>
        <Input
          {...form.register("submittedBy")}
          placeholder="your.email@example.com"
        />
        <p className="text-xs text-muted-foreground">
          We will send you a confirmation email when your update request is
          approved.
        </p>
        <p className="text-xs text-destructive">
          {form.formState.errors.submittedBy?.message}
        </p>
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
  const formEventId = form.watch("eventId");
  const formAoId = form.watch("aoId");
  const formRegionId = form.watch("regionId");
  const formLocationId = form.watch("locationId");
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">formId: {formId};</p>
      <p className="text-sm text-muted-foreground">regionId: {formRegionId};</p>
      <p className="text-sm text-muted-foreground">aoId: {formAoId};</p>
      <p className="text-sm text-muted-foreground">
        locationId: {formLocationId};
      </p>
      <p className="text-sm text-muted-foreground">eventId: {formEventId}</p>
    </div>
  );
};
