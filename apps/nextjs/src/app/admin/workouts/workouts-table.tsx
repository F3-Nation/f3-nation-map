"use client";

import type { SortingState, TableOptions } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Check, ChevronsUpDown } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { IsActiveStatus } from "@acme/shared/app/enums";
import { dayOfWeekToShortDayOfWeek } from "@acme/shared/app/functions";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@acme/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { MDTable, usePagination } from "@acme/ui/md-table";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { Cell, Header } from "@acme/ui/table";

import { api } from "~/trpc/react";
import { DeleteType, ModalType, openModal } from "~/utils/store/modal";

const WorkoutIsActiveFilter = ({
  onStatusSelect,
  selectedStatuses,
}: {
  onStatusSelect: (status: IsActiveStatus) => void;
  selectedStatuses: IsActiveStatus[];
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
            {selectedStatuses.length > 0
              ? `${selectedStatuses.length} status${selectedStatuses.length > 1 ? "es" : ""} selected`
              : "Filter by status"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search statuses..." />
            <CommandEmpty>No statuses found.</CommandEmpty>
            <CommandGroup>
              {IsActiveStatus.map((status) => (
                <CommandItem
                  key={status}
                  value={status}
                  onSelect={() => {
                    onStatusSelect(status as IsActiveStatus);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedStatuses.includes(status as IsActiveStatus)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const WorkoutsTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { pagination, setPagination } = usePagination();
  const [selectedStatuses, setSelectedStatuses] = useState<IsActiveStatus[]>([
    "active",
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: workouts } = api.event.all.useQuery({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    searchTerm: searchTerm,
    sorting: sorting,
    statuses: selectedStatuses,
  });

  const handleStatusSelect = useCallback((status: IsActiveStatus) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  }, []);

  return (
    <MDTable
      data={workouts?.events}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      columns={columns}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_EVENTS, { id: row.original.id });
      }}
      totalCount={workouts?.total}
      pagination={pagination}
      setPagination={setPagination}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      sorting={sorting}
      setSorting={setSorting}
      filterComponent={
        <WorkoutIsActiveFilter
          onStatusSelect={handleStatusSelect}
          selectedStatuses={selectedStatuses}
        />
      }
    />
  );
};

const columns: TableOptions<
  RouterOutputs["event"]["all"]["events"][number]
>["columns"] = [
  {
    accessorKey: "name",
    meta: { name: "Event Name" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "regions",
    meta: { name: "Regions" },
    header: Header,
    cell: (cell) => (
      <Cell {...cell}>
        {cell.row.original.regions
          .map((region) => region.regionName)
          .join(", ")}
      </Cell>
    ),
  },
  {
    accessorKey: "location",
    meta: { name: "Location" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "dayOfWeek",
    meta: { name: "Day of Week" },
    accessorFn: (row) => dayOfWeekToShortDayOfWeek(row.dayOfWeek ?? "sunday"),
    header: Header,
    cell: Cell,
  },
  {
    accessorKey: "isActive",
    meta: { name: "Status" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
              row.original.isActive
                ? "border-green-200 bg-green-100 text-green-700"
                : "border-red-200 bg-red-100 text-red-700"
            }`}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "created",
    accessorFn: (row) => new Date(row.created).toLocaleDateString(),
    meta: { name: "Created At" },
    header: Header,
    cell: Cell,
  },
  {
    id: "id",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                openModal(ModalType.ADMIN_DELETE_CONFIRMATION, {
                  id: Number(row.original.id),
                  type: DeleteType.EVENT,
                });
              }}
            >
              <div>Delete</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
