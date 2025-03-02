"use client";

import type { TableOptions } from "@tanstack/react-table";

import type { RouterOutputs } from "@acme/api";
import { MDTable } from "@acme/ui/md-table";
import { Cell, Header } from "@acme/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { ModalType, openModal } from "~/utils/store/modal";

export const LocationsTable = ({
  locations,
}: {
  locations: RouterOutputs["location"]["all"];
}) => {
  console.log("locationsTable", locations);
  return (
    <MDTable
      data={locations}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      columns={columns}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_LOCATIONS, { id: row.original.id });
      }}
      // rowClassName={(row) => {
      //   if (row.original.submitterValidated === true) {
      //     return "opacity-30";
      //   }
      // }}
    />
  );
};

const columns: TableOptions<
  RouterOutputs["location"]["all"][number]
>["columns"] = [
  {
    accessorKey: "regionName",
    meta: { name: "Region" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "aoName",
    meta: { name: "AO" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "name",
    meta: { name: "Location" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "events",
    meta: { name: "Events" },
    header: Header,
    cell: (cell) => (
      <Cell {...cell}>
        <Tooltip>
          <TooltipTrigger>{cell.row.original.events.length}</TooltipTrigger>
          <TooltipContent>
            {cell.row.original.events.length > 0
              ? cell.row.original.events.map((event) => event.name).join(", ")
              : "No events"}
          </TooltipContent>
        </Tooltip>
      </Cell>
    ),
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
  // {
  //   accessorKey: "description",
  //   meta: { name: "Description" },
  //   header: Header,
  //   cell: (cell) => <Cell {...cell} />,
  // },
  // {
  //   accessorKey: "email",
  //   meta: { name: "Email" },
  //   header: Header,
  //   cell: (cell) => <Cell {...cell} />,
  // },
  {
    accessorKey: "latitude",
    meta: { name: "Latitude" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "longitude",
    meta: { name: "Longitude" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "addressStreet",
    meta: { name: "Street" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "addressStreet2",
    meta: { name: "Street 2" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "addressCity",
    meta: { name: "City" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "addressState",
    meta: { name: "State" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "addressZip",
    meta: { name: "Zip" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "addressCountry",
    meta: { name: "Country" },
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
