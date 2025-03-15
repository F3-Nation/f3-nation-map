"use client";

import type { TableOptions } from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import type { UserRole } from "@acme/shared/app/enums";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@acme/ui/command";
import { MDTable } from "@acme/ui/md-table";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { Cell, Header } from "@acme/ui/table";

import { api } from "~/trpc/react";
import usePagination from "~/utils/hooks/use-pagination";
import { ModalType, openModal } from "~/utils/store/modal";

const roles: UserRole[] = ["admin", "editor", "user"];

const UserFilter = ({
  onRoleSelect,
  selectedRoles,
}: {
  onRoleSelect: (role: UserRole) => void;
  selectedRoles: UserRole[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-80">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedRoles.length > 0
              ? `${selectedRoles.length} role${selectedRoles.length > 1 ? "s" : ""} selected`
              : "Filter by role"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search roles..." />
            <CommandEmpty>No roles found.</CommandEmpty>
            <CommandGroup>
              {roles.map((role) => (
                <CommandItem
                  key={role}
                  value={role}
                  onSelect={() => {
                    onRoleSelect(role);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedRoles.includes(role)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const UserTable = () => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([
    "admin",
    "editor",
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { pagination, setPagination } = usePagination({
    pageSize: 20,
  });

  // Use a ref to track if this is the initial render
  const isInitialRender = useRef(true);

  const selectedRolesRef = useRef(selectedRoles);

  // Update the ref when selectedRoles changes
  useEffect(() => {
    selectedRolesRef.current = selectedRoles;
  }, [selectedRoles]);

  // Separate the role selection handler to have better control
  const handleRoleSelect = useCallback((role: UserRole) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        return prev.filter((r) => r !== role);
      } else {
        return [...prev, role];
      }
    });
  }, []);

  const { data: { users, count } = {} } = api.user.all.useQuery(
    {
      roles: selectedRoles,
      searchTerm: debouncedSearchTerm,
      pageSize: pagination.pageSize,
      pageIndex: pagination.pageIndex,
    },
    {
      // Only refetch when these dependencies actually change
      // Prevent unnecessary refetches
      staleTime: 30000,
      // keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (!isInitialRender.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    } else {
      isInitialRender.current = false;
    }
  }, [selectedRoles, debouncedSearchTerm, setPagination]);

  return (
    <MDTable
      data={users ?? []}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterComponent={
        <UserFilter
          onRoleSelect={handleRoleSelect}
          selectedRoles={selectedRoles}
        />
      }
      cellClassName="p-1"
      columns={columns}
      pagination={pagination}
      totalCount={count}
      setPagination={setPagination}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_USERS, { id: row.original.id });
      }}
      rowClassName={(row) => {
        if (row.original.status === "inactive") {
          return "opacity-30";
        }
      }}
    />
  );
};

const columns: TableOptions<
  RouterOutputs["user"]["all"]["users"][number]
>["columns"] = [
  {
    accessorKey: "name",
    meta: { name: "Name" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "f3Name",
    meta: { name: "F3 Name" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "roles",
    meta: { name: "Roles" },
    header: Header,
    cell: ({ row }) => {
      const roleStyles = {
        admin: "bg-purple-100 text-purple-700 border-purple-200",
        editor: "bg-blue-100 text-blue-700 border-blue-200",
        user: "bg-green-100 text-green-700 border-green-200",
      } as const;

      const roleLabels = {
        admin: "Admin",
        editor: "Editor",
        user: "User",
      } as const;

      return (
        <div className="flex flex-wrap items-center justify-start">
          {row.original.roles.map((role) => (
            <span
              key={role.orgId}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                roleStyles[role.roleName]
              }`}
            >
              {role.orgName} ({roleLabels[role.roleName]})
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    meta: { name: "Status" },
    header: Header,
    cell: ({ row }) => {
      const statusStyles = {
        active: "bg-green-100 text-green-700 border-green-200",
        inactive: "bg-red-100 text-red-700 border-red-200",
      } as const;

      const statusLabels = {
        active: "Active",
        inactive: "Inactive",
      } as const;

      return (
        <div className="flex items-center justify-start">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
              statusStyles[row.original.status]
            }`}
          >
            {statusLabels[row.original.status]}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    meta: { name: "Email" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },

  {
    accessorKey: "phone",
    meta: { name: "Phone" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "regions",
    meta: { name: "Regions" },
    header: Header,
    cell: (cell) => (
      <Cell {...cell}>
        {cell.row.original.roles.map((role) => role.orgName).join(", ")}
      </Cell>
    ),
  },
  // {
  //   accessorKey: "emergencyContact",
  //   meta: { name: "Emergency Contact" },
  //   header: Header,
  //   cell: (cell) => <Cell {...cell} />,
  // },
  // {
  //   accessorKey: "emergencyPhone",
  //   meta: { name: "Emergency Phone" },
  //   header: Header,
  //   cell: (cell) => <Cell {...cell} />,
  // },
  // {
  //   accessorKey: "emergencyNotes",
  //   meta: { name: "Emergency Notes" },
  //   header: Header,
  //   cell: (cell) => <Cell {...cell} />,
  // },

  {
    accessorKey: "created",
    accessorFn: (row) => new Date(row.created).toLocaleDateString(),
    meta: { name: "Created At" },
    header: Header,
    cell: Cell,
  },
];

const useDebounce = <T,>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};
