"use client";

import type { TableOptions } from "@tanstack/react-table";
import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import type { RouterOutputs } from "@acme/api";
import type { SortingSchema } from "@acme/validators";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { MDTable } from "@acme/ui/md-table";
import { Cell, Header } from "@acme/ui/table";

import { api } from "~/trpc/react";
import { DeleteType, ModalType, openModal } from "~/utils/store/modal";
import { OrgFilter } from "./org-filter";

type Org = RouterOutputs["org"]["all"]["orgs"][number];

export const EventTypesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingSchema>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<Org[]>([]);
  const { data: eventTypes } = api.eventType.all.useQuery({
    orgIds: selectedOrgs.map((org) => org.id),
  });

  const handleOrgSelect = (org: Org) => {
    setSelectedOrgs((prev) => {
      if (prev.includes(org)) {
        return prev.filter((s) => s !== org);
      } else {
        return [...prev, org];
      }
    });
  };

  return (
    <MDTable
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      data={eventTypes?.eventTypes}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      totalCount={eventTypes?.total}
      columns={columns}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_EVENT_TYPES, { id: row.original.id });
      }}
      sorting={sorting}
      setSorting={setSorting}
      filterComponent={
        <OrgFilter onOrgSelect={handleOrgSelect} selectedOrgs={selectedOrgs} />
      }
    />
  );
};

const columns: TableOptions<
  RouterOutputs["eventType"]["all"]["eventTypes"][number]
>["columns"] = [
  {
    accessorKey: "name",
    meta: { name: "Name" },
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
    accessorKey: "eventCategory",
    meta: { name: "Event Category" },
    header: Header,
    cell: (cell) => {
      const ec = cell.row.original.eventCategory;
      const roleStyles = {
        first_f: "bg-purple-100 text-purple-700 border-purple-200",
        second_f: "bg-blue-100 text-blue-700 border-blue-200",
        third_f: "bg-green-100 text-green-700 border-green-200",
      } as const;

      const roleLabels = {
        first_f: "1st F",
        second_f: "2nd F",
        third_f: "3rd F",
      } as const;

      return (
        <div className="flex flex-wrap items-center justify-start">
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${roleStyles[ec]}`}
          >
            {roleLabels[ec]}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "specificOrgName",
    accessorFn: (row) => row.specificOrgName,
    meta: { name: "Specific Org" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "count",
    meta: { name: "Count" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
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
                  type: DeleteType.EVENT_TYPE,
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
