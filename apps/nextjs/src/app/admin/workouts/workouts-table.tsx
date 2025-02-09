"use client";

import type { TableOptions } from "@tanstack/react-table";

import type { RouterOutputs } from "@f3/api";
import { MDTable } from "@f3/ui/md-table";
import { Cell, Header } from "@f3/ui/table";

import { ModalType, openModal } from "~/utils/store/modal";

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
      meta: { name: "Workout Name" },
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
      accessorKey: "created",
      accessorFn: (row) => new Date(row.created).toLocaleDateString(),
      meta: { name: "Created At" },
      header: Header,
      cell: Cell,
    },
  ];
