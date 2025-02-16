"use client";

import type { TableOptions } from "@tanstack/react-table";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import type { RouterOutputs } from "@f3/api";
import { DAY_ORDER } from "@f3/shared/app/constants";
import { Button } from "@f3/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@f3/ui/dropdown-menu";
import { MDTable } from "@f3/ui/md-table";
import { Cell, Header } from "@f3/ui/table";

import { DeleteType, ModalType, openModal } from "~/utils/store/modal";

export const WorkoutsTable = ({
  workouts,
}: {
  workouts: RouterOutputs["event"]["all"];
}) => {
  return (
    <MDTable
      data={workouts}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      columns={columns}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_EVENTS, { id: row.original.id });
      }}
    />
  );
};

const columns: TableOptions<RouterOutputs["event"]["all"][number]>["columns"] =
  [
    {
      accessorKey: "name",
      meta: { name: "Event Name" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    {
      accessorKey: "regionName",
      meta: { name: "Region" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
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
      accessorFn: (row) => DAY_ORDER[row.dayOfWeek ?? -1],
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
