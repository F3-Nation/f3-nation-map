"use client";
"use client";

import type { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Z_INDEX } from "@acme/shared/app/constants";
import { safeParseInt } from "@acme/shared/common/functions";
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
import { ControlledSelect } from "@acme/ui/select";
import { Spinner } from "@acme/ui/spinner";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import { EventTypeInsertSchema } from "@acme/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { closeModal } from "~/utils/store/modal";
import { VirtualizedCombobox } from "../virtualized-combobox";

const EventTypeInsertForm = EventTypeInsertSchema;
type EventTypeInsertFormType = z.infer<typeof EventTypeInsertForm>;

export default function AdminEventTypesModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_EVENT_TYPES];
}) {
  const utils = api.useUtils();
  const { data: eventType } = api.eventType.byId.useQuery(
    { id: data.id ?? -1 },
    { enabled: !!data.id },
  );
  const { data: orgs } = api.org.all.useQuery({ orgTypes: ["region"] });
  const sortedOrgs = useMemo(() => {
    return orgs?.orgs.sort((a, b) => {
      return a.orgType.localeCompare(b.orgType) || a.name.localeCompare(b.name);
    });
  }, [orgs]);
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    schema: EventTypeInsertForm,
  });

  useEffect(() => {
    form.reset({
      id: eventType?.id,
      name: eventType?.name ?? "",
      description: eventType?.description ?? "",
      specificOrgId: eventType?.specificOrgId ?? null,
      eventCategory: eventType?.eventCategory ?? undefined,
    });
  }, [form, eventType]);

  const crupdateEventType = api.eventType.crupdate.useMutation({
    onSuccess: async () => {
      await utils.eventType.invalidate();
      closeModal();
      toast.success("Successfully updated event type");
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

  const onSubmit = async (data: EventTypeInsertFormType) => {
    // // Validate event type
    // if (!data.eventTypeId) {
    //   form.setError("eventTypeId", { message: "Event type is required" });
    //   toast.error("Event type is required");
    //   return;
    // }

    setIsSubmitting(true);
    try {
      await crupdateEventType.mutateAsync({
        // Need to pass null for specificOrgId if it's not set
        ...data,
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
        className={cn(`max-w-[90%] rounded-lg lg:max-w-[600px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            {eventType?.id ? "Edit" : "Add"} Event Type
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
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
              <ControlledSelect
                control={form.control}
                label="Event Category"
                name="eventCategory"
                options={[
                  { label: "1st F", value: "first_f" },
                  { label: "2nd F", value: "second_f" },
                  { label: "3rd F", value: "third_f" },
                ]}
              />
            </div>
            <div className="mb-4 w-1/2 px-2">
              <FormField
                control={form.control}
                name="specificOrgId"
                render={({ field }) => (
                  <FormItem key={`region-${field.value}`}>
                    <FormLabel>Specific Org</FormLabel>
                    <VirtualizedCombobox
                      value={field.value?.toString()}
                      options={
                        sortedOrgs?.map((org) => ({
                          value: org.id.toString(),
                          label: `${org.orgType}: ${org.name}`,
                        })) ?? []
                      }
                      searchPlaceholder="Select a region"
                      onSelect={(value) => {
                        if (typeof value === "string") {
                          const numberValue = safeParseInt(value);
                          if (numberValue === field.value) {
                            field.onChange(null);
                          } else {
                            field.onChange(safeParseInt(value));
                          }
                        } else {
                          field.onChange(null);
                        }
                      }}
                      isMulti={false}
                    />
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
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    void form.handleSubmit(onSubmit, (errors) => {
                      console.log(errors);
                      toast.error("Failed to update event type");
                    })();
                  }}
                >
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
