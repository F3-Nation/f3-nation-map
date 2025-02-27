"use client";

import type { TableOptions } from "@tanstack/react-table";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import type { RouterOutputs } from "@f3/api";
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

export const NationsTable = ({
  nations,
}: {
  nations: RouterOutputs["nation"]["all"];
}) => {
  return (
    <MDTable
      data={nations}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      columns={columns}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_NATIONS, { id: row.original.id });
      }}
      // rowClassName={(row) => {
      //   if (row.original.submitterValidated === true) {
      //     return "opacity-30";
      //   }
      // }}
    />
  );
};

const columns: TableOptions<RouterOutputs["nation"]["all"][number]>["columns"] =
  [
    {
      accessorKey: "name",
      meta: { name: "Nation" },
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
    // {
    //   accessorKey: "website",
    //   meta: { name: "Website" },
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
                    type: DeleteType.NATION,
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
