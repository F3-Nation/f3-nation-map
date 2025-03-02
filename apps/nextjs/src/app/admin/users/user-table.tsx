"use client";

import type { TableOptions } from "@tanstack/react-table";

import type { RouterOutputs } from "@acme/api";
import { MDTable } from "@acme/ui/md-table";
import { Cell, Header } from "@acme/ui/table";

import { ModalType, openModal } from "~/utils/store/modal";

export const UserTable = ({
  users,
}: {
  users: RouterOutputs["user"]["all"];
}) => {
  return (
    <MDTable
      data={users}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      columns={columns}
      onRowClick={(row) => {
        openModal(ModalType.ADMIN_USERS, { id: row.original.id });
      }}
      rowClassName={(row) => {
        if (row.original.status === "inactive") {
          return "opacity-30";
        }
      }}
    />
  );
};

const columns: TableOptions<RouterOutputs["user"]["all"][number]>["columns"] = [
  {
    accessorKey: "name",
    meta: { name: "Name" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "f3Name",
    meta: { name: "F3 Name" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "roles",
    meta: { name: "Roles" },
    header: Header,
    cell: ({ row }) => {
      const roleStyles = {
        admin: "bg-purple-100 text-purple-700 border-purple-200",
        editor: "bg-blue-100 text-blue-700 border-blue-200",
        user: "bg-green-100 text-green-700 border-green-200",
      } as const;

      const roleLabels = {
        admin: "Admin",
        editor: "Editor",
        user: "User",
      } as const;

      return (
        <div className="flex flex-wrap items-center justify-start">
          {row.original.roles.map((role) => (
            <span
              key={role.orgId}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                roleStyles[role.roleName]
              }`}
            >
              {role.orgName} ({roleLabels[role.roleName]})
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    meta: { name: "Status" },
    header: Header,
    cell: ({ row }) => {
      const statusStyles = {
        active: "bg-green-100 text-green-700 border-green-200",
        inactive: "bg-red-100 text-red-700 border-red-200",
      } as const;

      const statusLabels = {
        active: "Active",
        inactive: "Inactive",
      } as const;

      return (
        <div className="flex items-center justify-start">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
              statusStyles[row.original.status]
            }`}
          >
            {statusLabels[row.original.status]}
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
    accessorKey: "phone",
    meta: { name: "Phone" },
    header: Header,
    cell: (cell) => <Cell {...cell} />,
  },
  {
    accessorKey: "regions",
    meta: { name: "Regions" },
    header: Header,
    cell: (cell) => (
      <Cell {...cell}>
        {cell.row.original.roles.map((role) => role.orgName).join(", ")}
      </Cell>
    ),
  },
  // {
  //   accessorKey: "emergencyContact",
  //   meta: { name: "Emergency Contact" },
  //   header: Header,
  //   cell: (cell) => <Cell {...cell} />,
  // },
  // {
  //   accessorKey: "emergencyPhone",
  //   meta: { name: "Emergency Phone" },
  //   header: Header,
  //   cell: (cell) => <Cell {...cell} />,
  // },
  // {
  //   accessorKey: "emergencyNotes",
  //   meta: { name: "Emergency Notes" },
  //   header: Header,
  //   cell: (cell) => <Cell {...cell} />,
  // },

  {
    accessorKey: "created",
    accessorFn: (row) => new Date(row.created).toLocaleDateString(),
    meta: { name: "Created At" },
    header: Header,
    cell: Cell,
  },
];
