"use client";

import type { TableOptions } from "@tanstack/react-table";

import type { RouterOutputs } from "@f3/api";
import { MDTable } from "@f3/ui/md-table";
import { Cell, Header } from "@f3/ui/table";

import { ModalType, openModal } from "~/utils/store/modal";

export const RegionsTable = ({
  regions,
}: {
  regions: RouterOutputs["region"]["all"];
}) => {
  return (
    <MDTable
      data={regions}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      columns={columns}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_REGIONS, { id: row.original.id });
      }}
      // rowClassName={(row) => {
      //   if (row.original.submitterValidated === true) {
      //     return "opacity-30";
      //   }
      // }}
    />
  );
};

const columns: TableOptions<RouterOutputs["region"]["all"][number]>["columns"] =
  [
    {
      accessorKey: "logo",
      meta: { name: "Logo" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    {
      accessorKey: "area",
      meta: { name: "Area" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    {
      accessorKey: "name",
      meta: { name: "Name" },
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
      accessorKey: "description",
      meta: { name: "Description" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    {
      accessorKey: "website",
      meta: { name: "Website" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    {
      accessorKey: "email",
      meta: { name: "Email" },
      header: Header,
      cell: (cell) => <Cell {...cell} />,
    },
    // {
    //   accessorKey: "twitter",
    //   meta: { name: "Twitter" },
    //   header: Header,
    //   cell: (cell) => <Cell {...cell} />,
    // },
    // {
    //   accessorKey: "facebook",
    //   meta: { name: "Facebook" },
    //   header: Header,
    //   cell: (cell) => <Cell {...cell} />,
    // },
    // {
    //   accessorKey: "instagram",
    //   meta: { name: "Instagram" },
    //   header: Header,
    //   cell: (cell) => <Cell {...cell} />,
    // },
    {
      accessorKey: "lastAnnualReview",
      accessorFn: (row) =>
        row.lastAnnualReview == null
          ? ""
          : new Date(row.lastAnnualReview).toLocaleDateString(),
      meta: { name: "Last Annual Review" },
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
