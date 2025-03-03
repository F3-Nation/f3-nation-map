"use client";

import { useEffect, useMemo, useState } from "react";
import dynamicImport from "next/dynamic";
import { useRouter } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { z } from "zod";

import { DEFAULT_CENTER, Z_INDEX } from "@acme/shared/app/constants";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Spinner } from "@acme/ui/spinner";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { LocationInsertSchema } from "@acme/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { closeModal } from "~/utils/store/modal";
import { CountrySelect } from "./country-select";

const DynamicImportLeafletMapSimple = dynamicImport(
  () => import("~/app/_components/map/leaflet-map-simple"),
  { ssr: false },
);

interface LeafletMapSimpleProps {
  latitude: number;
  longitude: number;
  dragEventHandler?: {
    dragend?: (e: { target: L.Marker }) => void;
  };
}

const LeafletMapWithProps =
  DynamicImportLeafletMapSimple as unknown as React.FC<LeafletMapSimpleProps>;

export default function AdminLocationsModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_LOCATIONS];
}) {
  const utils = api.useUtils();
  const { data: location } = api.location.byId.useQuery({ id: data.id ?? -1 });
  const { data: regions } = api.region.all.useQuery();
  const { data: aos } = api.ao.all.useQuery();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    schema: LocationInsertSchema.extend({
      regionId: z.number(),
    }),
    defaultValues: {
      id: location?.id ?? undefined,
      name: location?.name ?? "",
      description: location?.description ?? "",
      isActive: location?.isActive ?? true,
      orgId: location?.orgId ?? -1,
      regionId: location?.regionId ?? -1,
      latitude: location?.latitude ? location.latitude : DEFAULT_CENTER[0],
      longitude: location?.longitude ? location.longitude : DEFAULT_CENTER[1],
      addressStreet: location?.addressStreet ?? null,
      addressCity: location?.addressCity ?? null,
      addressState: location?.addressState ?? null,
      addressZip: location?.addressZip ?? null,
      addressCountry: location?.addressCountry ?? null,
      //meta: location?.meta ?? null,
    },
  });

  useEffect(() => {
    form.reset({
      id: location?.id ?? undefined,
      name: location?.name ?? "",
      description: location?.description ?? "",
      isActive: location?.isActive ?? true,
      orgId: location?.orgId ?? -1,
      regionId: location?.regionId ?? -1,
      latitude: location?.latitude ? location.latitude : DEFAULT_CENTER[0],
      longitude: location?.longitude ? location.longitude : DEFAULT_CENTER[1],
      addressStreet: location?.addressStreet ?? null,
      addressCity: location?.addressCity ?? null,
      addressState: location?.addressState ?? null,
      addressZip: location?.addressZip ?? null,
      addressCountry: location?.addressCountry ?? null,
      // meta: location?.meta ?? null,
    });
  }, [form, location]);

  const crupdateLocation = api.location.crupdate.useMutation({
    onSuccess: async () => {
      await utils.location.invalidate();
      closeModal();
      toast.success("Successfully updated location");
      router.refresh();
    },
    onError: (err) => {
      toast.error(
        err?.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update users"
          : "Failed to update user",
      );
    },
  });

  const dragEventHandler = useMemo(
    () => ({
      dragend(e: { target: L.Marker }) {
        const { lat, lng } = e.target.getLatLng();
        form.setValue("latitude", lat);
        form.setValue("longitude", lng);
      },
    }),
    [form],
  );

  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg bg-muted lg:max-w-[1024px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Edit Location</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap">
          <div className="w-1/2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  async (data) => {
                    setIsSubmitting(true);
                    try {
                      await crupdateLocation.mutateAsync(data);
                    } catch (error) {
                      toast.error("Failed to update location");
                      console.error(error);
                    } finally {
                      setIsSubmitting(false);
                    }
                  },
                  (error) => {
                    toast.error("Failed to update location");
                    console.log(error);
                    setIsSubmitting(false);
                  },
                )}
                className="space-y-4"
              >
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <CircleHelp
                                  size={14}
                                  className="display-inline ml-2"
                                />
                              </TooltipTrigger>
                              <TooltipContent>Lorem Ipsum</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => {
                              const selectedValue = Number(value);
                              field.onChange(selectedValue);
                              form.setValue("orgId", -1); // Reset ao selection
                            }}
                            defaultValue={field.value?.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a region" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions
                                ?.slice()
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((region) => (
                                  <SelectItem
                                    key={`region-${region.id}`}
                                    value={region.id.toString()}
                                  >
                                    {region.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mb-4 w-1/2 px-2">
                    <FormField
                      control={form.control}
                      name="orgId"
                      render={({ field }) => {
                        const filteredAOs = aos?.filter(
                          (ao) => ao.parentId === form.watch("regionId"),
                        );
                        return (
                          <FormItem key={`ao-${field.value}`}>
                            <FormLabel>Location</FormLabel>
                            <Select
                              value={field.value?.toString()}
                              onValueChange={(value) => {
                                field.onChange(Number(value));

                                const selectedAO = aos?.find(
                                  (ao) => ao.id === Number(value),
                                );
                                if (selectedAO) {
                                  form.setValue("orgId", Number(selectedAO.id));
                                }
                              }}
                              defaultValue={field.value?.toString()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an AO" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredAOs
                                  ?.slice()
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map((location) => (
                                    <SelectItem
                                      key={`ao-${location.id}`}
                                      value={location.id.toString()}
                                    >
                                      {location.name}
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
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Latitude"
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
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Longitude"
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
                      name="addressStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Street"
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
                      name="addressCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City"
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
                      name="addressState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="State"
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
                      name="addressZip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Zip"
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
                    <CountrySelect
                      control={form.control}
                      name="addressCountry"
                    />
                  </div>

                  <div className="mb-4 w-full px-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              rows={5}
                            />
                          </FormControl>
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
          </div>
          <div className="w-1/2">
            <LeafletMapWithProps
              latitude={form.getValues("latitude") ?? DEFAULT_CENTER[0]}
              longitude={form.getValues("longitude") ?? DEFAULT_CENTER[1]}
              dragEventHandler={dragEventHandler}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
