"use client";

import type { TableOptions } from "@tanstack/react-table";

import type { RouterOutputs } from "@f3/api";
import { cn } from "@f3/ui";
import { MDTable } from "@f3/ui/md-table";
import { Cell, Header } from "@f3/ui/table";

import { ModalType, openModal } from "~/utils/store/modal";

export const RequestsTable = ({
  requests,
}: {
  requests: RouterOutputs["request"]["all"];
}) => {
  return (
    <MDTable
      data={requests}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      columns={columns}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_REQUESTS, { id: row.original.id });
      }}
      rowClassName={(row) => {
        if (row.original.submitterValidated === true) {
          return "opacity-30";
        }
      }}
    />
  );
};

const columns: TableOptions<
  RouterOutputs["request"]["all"][number]
>["columns"] = [
  {
    accessorKey: "regionName",
    meta: { name: "Region" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "workoutName",
    meta: { name: "Workout" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "submitterValidated",
    meta: { name: "Status" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          <span
            className={cn(
              `inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium`,
              {
                "border-green-200 bg-green-100 text-green-700":
                  row.original.submitterValidated,
                "border-red-200 bg-red-100 text-red-700":
                  !row.original.submitterValidated,
              },
            )}
          >
            {row.original.submitterValidated ? "Validated" : "Pending"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "submittedBy",
    meta: { name: "Submitted By" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          <span>{row.original.submittedBy}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "created",
    accessorFn: (row) => row.created?.toLocaleDateString(),
    meta: { name: "Created At" },
    header: Header,
    cell: Cell,
  },
];
