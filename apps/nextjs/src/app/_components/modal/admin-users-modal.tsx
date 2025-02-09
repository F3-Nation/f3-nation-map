"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { Button } from "@f3/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@f3/ui/form";
import { Input } from "@f3/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@f3/ui/select";
import { toast } from "@f3/ui/toast";
import { CrupdateUserSchema } from "@f3/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { closeModal } from "~/utils/store/modal";
import { VirtualizedCombobox } from "../virtualized-combobox";

export default function UserModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_USERS];
}) {
  const utils = api.useUtils();
  const { data: user } = api.user.byId.useQuery({ id: data.id });
  const router = useRouter();

  const form = useForm({
    schema: CrupdateUserSchema.extend({
      badImage: z.boolean().default(false),
    }),
    defaultValues: {
      id: user?.id ?? -1,
      //name: user?.name ?? "",
      f3Name: user?.f3Name ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      // phone: user?.phone ?? null,
      // emergencyContact: user?.emergencyContact ?? null,
      // emergencyPhone: user?.emergencyPhone ?? null,
      // emergencyNotes: user?.emergencyNotes ?? null,
      role: user?.role ?? "user",
      status: user?.status ?? "active",
      regionIds: user?.regions.map((region) => region.id) ?? [],
      // homeRegionIds: user?.homeRegionIds ?? 0,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        id: user.id ?? -1,
        //name: user?.name ?? "",
        f3Name: user?.f3Name ?? "",
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        role: user?.role ?? "user",
        status: user?.status ?? "active",
        regionIds: user?.regions.map((region) => region.id) ?? [],
        // homeRegionIds: user?.homeRegionIds ?? 0,
      });
    }
  }, [form, user]);

  const { data: regions } = api.region.all.useQuery();

  const crupdateUser = api.user.crupdate.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      closeModal();
      toast.success("Successfully updated user");
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

  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg bg-muted lg:max-w-[600px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Edit User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (data) => {
                crupdateUser.mutate(data);
              },
              (error) => {
                toast.error("Failed to update user");
                console.log(error);
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
                  name="f3Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>F3 Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="F3 Name"
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
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First Name"
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Name"
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone"
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
                  name="regionIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Editing Regions</FormLabel>
                      <FormControl>
                        <VirtualizedCombobox
                          isMulti
                          // buttonClassName="w-full rounded-md py-3 font-normal"
                          // hideSearchIcon
                          // key={data.id?.toString()}
                          // disabled if we got this from the data param
                          // disabled={typeof data.regionId === "number"}
                          options={
                            regions
                              ?.map((region) => ({
                                label: region.name,
                                value: region.id.toString(),
                              }))
                              .sort((a, b) => a.label.localeCompare(b.label)) ??
                            []
                          }
                          value={field.value?.map(String)}
                          onSelect={(item) => {
                            console.log("onSelect", item);
                            if (Array.isArray(item)) {
                              form.setValue("regionIds", item.map(Number));
                            }
                          }}
                          searchPlaceholder="Select"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Emergency Contact"
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
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Emergency Phone"
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
                  name="emergencyNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Notes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Emergency Notes"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}

              {/* <div className="mb-4 w-1/2 px-2">
                {form.getValues("role") === UserRole[1] && (
                  <FormField
                    control={form.control}
                    name="homeRegionIds"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <FormControl>
                            {regions ? (
                              <MultiSelect
                                defaultValue={(field.value ?? []).map(String)}
                                value={(field.value ?? []).map(String)}
                                options={regions.map((region) => ({
                                  label: region.name,
                                  value: region.id.toString(),
                                }))}
                                onValueChange={(values) =>
                                  field.onChange(values.map(Number))
                                }
                                placeholder="Select regions"
                              />
                            ) : (
                              <p>Loading regions...</p>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </div> */}

              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
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
                    Save Changes
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
