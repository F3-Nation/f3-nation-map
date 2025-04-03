"use client";

import type { SortingState, TableOptions } from "@tanstack/react-table";
import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { dayOfWeekToShortDayOfWeek } from "node_modules/@acme/shared/src/app/functions";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { MDTable, usePagination } from "@acme/ui/md-table";
import { Cell, Header } from "@acme/ui/table";

import { api } from "~/trpc/react";
import { DeleteType, ModalType, openModal } from "~/utils/store/modal";

export const WorkoutsTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { pagination, setPagination } = usePagination();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: workouts } = api.event.all.useQuery({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    searchTerm: searchTerm,
    sorting: sorting,
  });
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
