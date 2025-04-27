"use client";
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Z_INDEX } from "@acme/shared/app/constants";
import { DayOfWeek } from "@acme/shared/app/enums";
import {
  convertHH_mmToHHmm,
  convertHHmmToHH_mm,
} from "@acme/shared/app/functions";
import { Case } from "@acme/shared/common/enums";
import { convertCase, safeParseInt } from "@acme/shared/common/functions";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import {
  ControlledSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Spinner } from "@acme/ui/spinner";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import { EventInsertSchema } from "@acme/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { closeModal } from "~/utils/store/modal";
import { ControlledTimeInput } from "../time-input";
import { VirtualizedCombobox } from "../virtualized-combobox";

const EventInsertForm = EventInsertSchema.extend({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Start time must be in 24hr format (HH:mm)",
  }),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "End time must be in 24hr format (HH:mm)",
  }),
  eventTypeId: z.string().min(1, { message: "Event type is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  dayOfWeek: z.enum(DayOfWeek, {
    message: "Day of week is required",
  }),
});
type EventInsertFormType = z.infer<typeof EventInsertForm>;

export default function AdminWorkoutsModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_EVENTS];
}) {
  const utils = api.useUtils();
  const { data: regions } = api.org.all.useQuery({ orgTypes: ["region"] });
  const { data: locations } = api.location.all.useQuery();
  const { data: aos } = api.org.all.useQuery({ orgTypes: ["ao"] });
  const { data: event } = api.event.byId.useQuery({ id: data.id ?? -1 });
  const { data: eventTypes } = api.event.types.useQuery();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    schema: EventInsertForm,
  });

  useEffect(() => {
    form.reset({
      id: event?.id,
      name: event?.name ?? "",
      locationId: event?.locationId ?? null,
      email: event?.email, // must keep undefined as "" is broken email
      startTime: convertHHmmToHH_mm(event?.startTime ?? ""),
      endTime: convertHHmmToHH_mm(event?.endTime ?? ""),
      startDate: event?.startDate ?? "",
      dayOfWeek: event?.dayOfWeek ?? undefined,
      isActive: event?.isActive ?? true,
      highlight: event?.highlight ?? false,
      regionId: event?.regions?.[0]?.regionId ?? undefined,
      aoId: event?.aos?.[0]?.aoId ?? undefined,
      eventTypeId: event?.eventTypes?.[0]?.eventTypeId?.toString() ?? undefined,
      meta: {
        mapSeed: event?.meta?.mapSeed ?? false,
      },
    });
  }, [form, event]);

  const crupdateEvent = api.event.crupdate.useMutation({
    onSuccess: async () => {
      await utils.event.invalidate();
      closeModal();
      toast.success("Successfully updated event");
      router.refresh();
    },
    onError: (err) => {
      toast.error(
        err?.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update events"
          : "Failed to update event",
      );
    },
  });

  const onSubmit = async (data: EventInsertFormType) => {
    // Validate times
    const eventTypeId = safeParseInt(data.eventTypeId);
    if (!eventTypeId) {
      form.setError("eventTypeId", { message: "Event type is required" });
      toast.error("Event type is required");
      return;
    }

    const startTime = data.startTime;
    const endTime = data.endTime;

    if (startTime && endTime) {
      if (startTime > endTime) {
        form.setError("endTime", {
          message: "End time must be after start time",
        });
        toast.error("End time must be after start time");
        return;
      }
    }

    // Validate day of week
    // if (!data.dayOfWeek) {
    //   form.setError("dayOfWeek", { message: "Day of week is required" });
    //   toast.error("Day of week is required");
    //   return;
    // }

    // // Validate event type
    // if (!data.eventTypeId) {
    //   form.setError("eventTypeId", { message: "Event type is required" });
    //   toast.error("Event type is required");
    //   return;
    // }

    setIsSubmitting(true);
    try {
      await crupdateEvent.mutateAsync({
        ...data,
        eventTypeId,
        startTime: convertHH_mmToHHmm(startTime),
        endTime: convertHH_mmToHHmm(endTime),
      });
    } catch (error) {
      toast.error("Failed to update event");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg bg-muted lg:max-w-[600px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Edit Event</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap">
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input placeholder="ID" disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="regionId"
                  render={({ field }) => (
                    <FormItem key={`region-${field.value}`}>
                      <FormLabel>Region</FormLabel>
                      <VirtualizedCombobox
                        value={field.value?.toString()}
                        options={
                          regions?.orgs?.map((region) => ({
                            value: region.id.toString(),
                            label: region.name,
                          })) ?? []
                        }
                        searchPlaceholder="Select a region"
                        onSelect={(value) => {
                          const orgId = safeParseInt(value as string);
                          if (orgId == null) {
                            toast.error("Invalid orgId");
                            return;
                          }
                          field.onChange(orgId);
                        }}
                        isMulti={false}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="aoId"
                  render={({ field }) => {
                    const filteredAOs = aos?.orgs.filter(
                      (ao) => ao.parentId === form.watch("regionId"),
                    );
                    return (
                      <FormItem key={`ao-${field.value}`}>
                        <FormLabel>AO</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => {
                            const aoId = safeParseInt(value);
                            field.onChange(aoId);

                            const selectedAO = aos?.orgs.find(
                              (ao) => ao.id === aoId,
                            );
                            if (!selectedAO) {
                              toast.error("Invalid AO");
                              return;
                            }
                            if (selectedAO.parentId != null) {
                              form.setValue("regionId", selectedAO.parentId);
                            }

                            const regionId = form.getValues("regionId");
                            const regionLocations = locations?.locations.filter(
                              (l) => l.regionId === regionId,
                            );

                            // If the current location's parentId is not the selected AO, then we need to update the location
                            const locationId = form.getValues("locationId");
                            if (
                              !regionLocations?.find((l) => l.id === locationId)
                            ) {
                              form.setValue(
                                "locationId",
                                regionLocations?.[0]?.id ?? null,
                              );
                            }
                          }}
                          defaultValue={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredAOs
                              ?.slice()
                              .sort(
                                (a, b) =>
                                  a.name?.localeCompare(b.name ?? "") ?? 0,
                              )
                              .map((ao) => (
                                <SelectItem
                                  key={`ao-${ao.id}`}
                                  value={ao.id.toString()}
                                >
                                  {ao.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => {
                    const regionId = form.getValues("regionId");
                    const filteredLocations = locations?.locations.filter(
                      (location) => location.regionId === regionId,
                    );
                    return (
                      <FormItem key={`location-${field.value}`}>
                        <FormLabel>Location</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => {
                            console.log("locationId onValueChange", value);
                            field.onChange(Number(value));

                            const selectedLocation = locations?.locations.find(
                              (location) => location.id === Number(value),
                            );
                            if (selectedLocation?.regionId != null) {
                              form.setValue(
                                "regionId",
                                selectedLocation.regionId,
                              );
                            }
                          }}
                          defaultValue={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredLocations
                              ?.slice()
                              .sort(
                                (a, b) =>
                                  a.locationName?.localeCompare(
                                    b.locationName ?? "",
                                  ) ?? 0,
                              )
                              .map((location) => (
                                <SelectItem
                                  key={`location-${location.id}`}
                                  value={location.id.toString()}
                                >
                                  {location.locationName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-4 w-1/2 px-2">
                <ControlledSelect
                  control={form.control}
                  name="dayOfWeek"
                  label="Day of Week"
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
              </div>
              <div className="mb-4 w-1/2 px-2">
                <ControlledSelect
                  control={form.control}
                  placeholder="Select an event type"
                  name="eventTypeId"
                  label="Event Type"
                  options={eventTypes?.map((type) => ({
                    value: type.id.toString(),
                    label: type.name,
                  }))}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <ControlledTimeInput
                  control={form.control}
                  name="startTime"
                  id={"startTime"}
                  label={"Start Time"}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <ControlledTimeInput
                  control={form.control}
                  name="endTime"
                  id={"endTime"}
                  label={"End Time"}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Start Date"
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          value &&
                          field.onChange(value === "true" ? true : false)
                        }
                        value={field.value === true ? "true" : "false"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-full px-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <Textarea {...field} value={field.value ?? ""} rows={5} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-full px-2">
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => closeModal()}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full">
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        Saving... <Spinner className="size-4" />
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
