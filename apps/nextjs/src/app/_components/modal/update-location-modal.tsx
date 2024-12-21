import { useEffect, useState } from "react";
import gte from "lodash/gte";
import { z } from "zod";

import { DAY_ORDER, Z_INDEX } from "@f3/shared/app/constants";
import { Button } from "@f3/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";
import { Form, useForm } from "@f3/ui/form";
import { Input } from "@f3/ui/input";
import { ControlledSelect } from "@f3/ui/select";
import { Spinner } from "@f3/ui/spinner";
import { Textarea } from "@f3/ui/textarea";
import { toast } from "@f3/ui/toast";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { appStore } from "~/utils/store/app";
import { closeModal, useModalStore } from "~/utils/store/modal";
import { VirtualizedCombobox } from "../virtualized-combobox";

export const UpdateLocationModal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { open, data: rawData } = useModalStore();
  const { mutateAsync: updateLocation } =
    api.location.updateLocation.useMutation();

  const data = rawData as DataType[ModalType.UPDATE_LOCATION];

  const form = useForm({
    schema: z.object({
      workoutName: z.string().min(1, { message: "Workout name is required" }),
      workoutWebsite: z.string().nullable(),
      aoLogo: z.string(),
      eventId: z.number(),
      locationId: z.number(),
      regionId: z.number().refine((value) => value !== -1, {
        message: "Please select a region",
      }),
      email: z.string().email({
        message: "Invalid email address",
      }),
      lat: z.number(),
      lng: z.number(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, {
        message: "Start time must be in 24hr format (HH:MM)",
      }),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, {
        message: "End time must be in 24hr format (HH:MM)",
      }),
      dayOfWeek: z.string(),
      type: z.string(),
      eventDescription: z
        .string()
        .min(1, { message: "Description is required" }),
      locationAddress: z.string().min(1, {
        message: "Location address is required",
      }),
    }),
    defaultValues: {
      workoutName: "",
      workoutWebsite: "",
      aoLogo: "",
      eventId: -1,
      locationId: -1,
      locationAddress: "",
      regionId: -1,
      email: appStore.get("myEmail"),
      startTime: "",
      endTime: "",
      dayOfWeek: "",
      type: "",
      eventDescription: "",
    },
    mode: "onBlur",
  });

  // Get data information
  const formRegionId = form.watch("regionId");
  const formEventId = form.watch("eventId");

  const lat = data.lat;
  const lng = data.lng;
  const mode = data.mode;

  // Get form values
  const { data: regions } = api.location.getRegions.useQuery();
  const { data: locationEvents } = api.location.getRegionAos.useQuery(
    { regionId: formRegionId ?? -1 },
    { enabled: formRegionId !== null },
  );

  const onSubmit = form.handleSubmit(
    async (values) => {
      setIsSubmitting(true);
      console.log(values);
      appStore.setState({ myEmail: values.email });
      await updateLocation({
        orgId: values.regionId,
        eventName: values.workoutName,
        submittedBy: appStore.get("myEmail"),
        locationId: data.locationId,
        eventId: gte(data.eventId, 0) ? data.eventId ?? null : null,
        eventType: values.type,
        eventTag: null,
        eventStartTime: values.startTime ? values.startTime + ":00" : null,
        eventEndTime: values.endTime ? values.endTime + ":00" : null,
        eventDayOfWeek: values.dayOfWeek,
        eventDescription: values.eventDescription,
        locationDescription: values.locationAddress,
        locationLat: values.lat,
        locationLng: values.lng,
      });
      toast.success(
        "Request submitted. Please check your email to validate your submission.",
      );
      setIsSubmitting(false);
      closeModal();
    },
    (errors) => {
      // Get all error messages
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => {
          if (error?.message) {
            return `${field}: ${error.message}`;
          }
          return null;
        })
        .filter(Boolean);

      // Show a toast with the first error message, or a generic message if none found
      toast.error(
        <div>
          {errorMessages.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>,
      );
      console.log("Form validation errors:", errors);
    },
  );

  useEffect(() => {
    form.reset({
      regionId: data.regionId ?? -1,
      eventId: data.eventId ?? -1,
      locationId: data.locationId ?? -1,
      workoutName: data.workoutName ?? "",
      workoutWebsite: data.workoutWebsite ?? "",
      aoLogo: data.aoLogo ?? "",
      locationAddress: data.locationAddress ?? "",
      lat: data.lat ?? 0,
      lng: data.lng ?? 0,
      startTime: data.startTime?.slice(0, 5) ?? "05:30",
      endTime: data.endTime?.slice(0, 5) ?? "06:15",
      dayOfWeek:
        typeof data.dayOfWeek === "number" ? DAY_ORDER[data.dayOfWeek] : "",
      type: data.type ?? "Bootcamp",
      eventDescription: data.eventDescription ?? "",
      email: appStore.get("myEmail"),
    });
  }, [data, form]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        closeModal();
      }}
    >
      <DialogContent
        style={{ zIndex: Z_INDEX.WORKOUT_DETAILS_MODAL }}
        className="mb-40 rounded-lg px-4 sm:px-6 lg:px-8"
      >
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold sm:text-4xl">
                {mode === "edit-event" ? "Edit Event" : "Edit Location"}
                <p className="text-sm text-muted-foreground">
                  {lat?.toFixed(5)}, {lng?.toFixed(5)}
                </p>
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Region
                </div>
                <VirtualizedCombobox
                  buttonClassName="w-full rounded-md py-3 font-normal"
                  hideSearchIcon
                  key={formRegionId?.toString()}
                  // disabled if we got this from the data param
                  disabled={typeof data.regionId === "number"}
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
                    form.setValue("regionId", region?.id ?? -1);
                  }}
                  searchPlaceholder="Select"
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.regionId?.message}
                </p>
              </div>
              {typeof data.eventId === "number" && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Event
                  </div>
                  <VirtualizedCombobox
                    buttonClassName="w-full rounded-md py-3 font-normal"
                    // disabled if we got this from the data param
                    disabled={typeof data.eventId === "number"}
                    hideSearchIcon
                    key={formEventId?.toString()}
                    options={[
                      {
                        label: "New event",
                        value: "-1",
                      },
                      ...(locationEvents
                        ?.map((location) => ({
                          label: location.events.name,
                          value: location.events.id.toString(),
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)) ?? []),
                    ]}
                    value={formEventId?.toString()}
                    onSelect={(item) => {
                      const location = locationEvents?.find(
                        (location) => location.events.id.toString() === item,
                      );
                      form.setValue("eventId", location?.events.id ?? -1);
                    }}
                    searchPlaceholder={
                      !formRegionId
                        ? "Select a region first"
                        : locationEvents?.length === 0
                          ? "No events found"
                          : "Select"
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Workout Name
                </div>
                <Input
                  {...form.register("workoutName")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.workoutName?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Workout Website
                </div>
                <Input
                  {...form.register("workoutWebsite")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.workoutWebsite?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  AO Logo URL
                </div>
                <Input
                  {...form.register("aoLogo")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.aoLogo?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Address
                </div>
                <Input
                  {...form.register("locationAddress")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationAddress?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Start Time (24hr format)
                </div>
                <Input {...form.register("startTime")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.startTime?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  End Time (24hr format)
                </div>
                <Input {...form.register("endTime")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.endTime?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Day of Week
                </div>
                <ControlledSelect
                  control={form.control}
                  name="dayOfWeek"
                  options={DAY_ORDER.map((day) => ({
                    label: day,
                    value: day,
                  }))}
                  placeholder="Select a day of the week"
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.dayOfWeek?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Type
                </div>
                <ControlledSelect
                  control={form.control}
                  name="type"
                  options={["Bootcamp", "Ruck", "Run", "Swim"].map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  placeholder="Select a day of the week"
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.type?.message}
                </p>
              </div>

              <div className="col-span-2 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Workout Description
                </div>
                <Textarea {...form.register("eventDescription")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.eventDescription?.message}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Your Email
              </div>
              <Input
                {...form.register("email")}
                disabled={formRegionId === null}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.email?.message}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => closeModal()}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-blue-600 text-white hover:bg-blue-600/80"
                onClick={() => onSubmit()}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    Submitting... <Spinner className="size-4" />
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
