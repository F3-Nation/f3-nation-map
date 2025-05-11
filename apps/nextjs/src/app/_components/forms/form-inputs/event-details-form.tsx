import { Controller } from "react-hook-form";

import { DayOfWeek } from "@acme/shared/app/enums";
import { Case } from "@acme/shared/common/enums";
import { convertCase } from "@acme/shared/common/functions";
import { Input } from "@acme/ui/input";
import { MultiSelect } from "@acme/ui/multi-select";
import { ControlledSelect } from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";

import { api } from "~/trpc/react";
import { useUpdateFormContext } from "~/utils/forms";
import { ControlledTimeInput } from "./controlled-time-input";

export const EventDetailsForm = ({
  allowExistingEvent = false,
}: {
  allowExistingEvent?: boolean;
}) => {
  const form = useUpdateFormContext();
  const formRegionId = form.watch("regionId");

  // Get event types for the region
  const { data: eventTypes } = api.eventType.all.useQuery({
    orgIds: formRegionId ? [formRegionId] : [],
  });

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
          <ControlledTimeInput
            name="eventStartTime"
            id="eventStartTime"
            label="Start Time"
          />
        </div>
        <div className="space-y-2">
          <ControlledTimeInput
            name="eventEndTime"
            id="eventEndTime"
            label="End Time"
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
  );
};
