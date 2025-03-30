"use client";

import type { TableOptions } from "@tanstack/react-table";
import { useState } from "react";

import type { RouterOutputs } from "@acme/api";
import type { SortingSchema } from "@acme/validators";
import { MDTable, usePagination } from "@acme/ui/md-table";
import { Cell, Header } from "@acme/ui/table";

import { api } from "~/trpc/react";
import { ModalType, openModal } from "~/utils/store/modal";

export const LocationsTable = () => {
  const { pagination, setPagination } = usePagination();
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingSchema>([]);
  const { data: locations } = api.location.all.useQuery({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    searchTerm: searchTerm,
    sorting: sorting,
  });
  return (
    <MDTable
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      data={locations?.locations}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      totalCount={locations?.total}
      columns={columns}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_LOCATIONS, { id: row.original.id });
      }}
      pagination={pagination}
      setPagination={setPagination}
      sorting={sorting}
      setSorting={setSorting}
      // rowClassName={(row) => {
      //   if (row.original.submitterValidated === true) {
      //     return "opacity-30";
      //   }
      // }}
    />
  );
};

const columns: TableOptions<
  RouterOutputs["location"]["all"]["locations"][number]
>["columns"] = [
  {
    accessorKey: "locationName",
    meta: { name: "Location Name" },
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
    accessorKey: "aoName",
    meta: { name: "AO" },
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
