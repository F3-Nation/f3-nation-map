"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import type { RoleEntry } from "@f3/shared/app/types";
import { safeParseInt } from "@f3/shared/common/functions";
import { Button } from "@f3/ui/button";
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

import type { RouterOutputs } from "~/trpc/types";
import { VirtualizedCombobox } from "~/app/_components/virtualized-combobox";
import { api } from "~/trpc/react";

export default function UserMutate({
  user,
}: {
  user: RouterOutputs["user"]["byId"];
}) {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: regions } = api.region.all.useQuery();
  const sortedRegions = useMemo(() => {
    return regions?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];
  }, [regions]);

  const form = useForm({
    schema: CrupdateUserSchema,
    defaultValues: {
      id: user?.id,
      f3Name: user?.f3Name ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      roles: user?.roles ?? [],
    },
  });

  const crupdateUser = api.user.crupdate.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      router.push("/admin/users");
      toast.success("Successfully upserted user");
    },
    onError: (err) => {
      toast.error(
        err?.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to upsert users"
          : "Failed to upsert user",
      );
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              {user ? "Edit User" : "Create User"}
            </h2>
            <p className="text-sm text-gray-500">
              {user
                ? "Edit user information below"
                : "Create user information below"}
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                (data) => {
                  console.log(data);
                  crupdateUser.mutate(data);
                },
                (error) => {
                  toast.error("Failed to upsert user");
                  console.log(error);
                },
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="id"
                render={({ field }) =>
                  user ? (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input placeholder="ID" disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <></>
                  )
                }
              />
              <FormField
                control={form.control}
                name="f3Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
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

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <div className="space-y-2">
                      {((field.value as RoleEntry[]) || []).map(
                        (roleEntry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Select
                              onValueChange={(value) => {
                                const newRoles = [
                                  ...(field.value as RoleEntry[]),
                                ];
                                newRoles[index] = {
                                  orgId: roleEntry.orgId,
                                  role: value as "editor" | "admin",
                                };
                                field.onChange(newRoles);
                              }}
                              value={roleEntry.role}
                            >
                              <FormControl>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>

                            <VirtualizedCombobox
                              value={roleEntry.orgId.toString()}
                              options={sortedRegions.map((region) => ({
                                value: region.id.toString(),
                                label: region.name,
                              }))}
                              searchPlaceholder="Select a region"
                              onSelect={(value) => {
                                const orgId = safeParseInt(value as string);
                                if (orgId == undefined) {
                                  toast.error("Invalid orgId");
                                  return;
                                }
                                const newRoles = [
                                  ...(field.value as RoleEntry[]),
                                ];
                                newRoles[index] = {
                                  role: newRoles[index]?.role ?? "editor",
                                  orgId,
                                };
                                field.onChange(newRoles);
                              }}
                              isMulti={false}
                            />

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newRoles = [
                                  ...(field.value as RoleEntry[]),
                                ];
                                newRoles.splice(index, 1);
                                field.onChange(newRoles);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-500">
                            Admins can invite & edit
                          </p>
                          <p className="text-xs text-gray-500">
                            Editors can edit
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const newRoleEntry: RoleEntry = {
                              role: "editor",
                              orgId: 1,
                            };
                            field.onChange([
                              ...((field.value as RoleEntry[]) ?? []),
                              newRoleEntry,
                            ]);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Role
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/users")}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
