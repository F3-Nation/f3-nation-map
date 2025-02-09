"use client";

import type { TableOptions } from "@tanstack/react-table";

import type { RouterOutputs } from "@f3/api";
import { DAY_ORDER } from "@f3/shared/app/constants";
import { MDTable } from "@f3/ui/md-table";
import { Cell, Header } from "@f3/ui/table";

import { ModalType, openModal } from "~/utils/store/modal";

export const EventsTable = ({
  events: events,
}: {
  events: RouterOutputs["event"]["all"];
}) => {
  return (
    <MDTable
      data={events}
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
      accessorKey: "email",
      meta: { name: "Email" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    {
      accessorKey: "description",
      meta: { name: "Description" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    {
      accessorKey: "dayOfWeek",
      accessorFn: (row) =>
        row.dayOfWeek == null ? DAY_ORDER[0] : DAY_ORDER[row.dayOfWeek],
      meta: { name: "Day of Week" },
      header: Header,
      cell: Cell,
    },
    {
      accessorKey: "startTime",
      meta: { name: "Start Time" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    {
      accessorKey: "endTime",
      meta: { name: "End Time" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    {
      accessorKey: "created",
      accessorFn: (row) => new Date(row.created).toLocaleDateString(),
      meta: { name: "Created At" },
      header: Header,
      cell: Cell,
    },
  ];
