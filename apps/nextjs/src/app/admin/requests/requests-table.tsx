"use client";

import type { TableOptions } from "@tanstack/react-table";
import dayjs from "dayjs";

import type { RouterOutputs } from "@f3/api";
import { cn } from "@f3/ui";
import { Badge } from "@f3/ui/badge";
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
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldRegionName === row.original.newRegionName ? (
            <span>{row.original.oldRegionName}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newRegionName}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "locationName",
    meta: { name: "Location" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldLocationName === row.original.newLocationName ? (
            <span>{row.original.oldLocationName}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newLocationName}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "workoutName",
    meta: { name: "Workout" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldWorkoutName === row.original.newWorkoutName ? (
            <span>{row.original.oldWorkoutName}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newWorkoutName}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "dayOfWeek",
    meta: { name: "Day of Week" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldDayOfWeek === row.original.newDayOfWeek ? (
            <span>{row.original.oldDayOfWeek}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newDayOfWeek}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "startTime",
    meta: { name: "Start Time" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldStartTime === row.original.newStartTime ? (
            <span>{row.original.oldStartTime?.slice(0, 5) ?? "05:30"}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newStartTime?.slice(0, 5) ?? "05:30"}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "endTime",
    meta: { name: "End Time" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldEndTime === row.original.newEndTime ? (
            <span>{row.original.oldEndTime?.slice(0, 5) ?? "06:15"}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newEndTime?.slice(0, 5) ?? "06:15"}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    meta: { name: "Description" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldDescription === row.original.newDescription ? (
            <span>{row.original.oldDescription}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newDescription}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "locationAddress",
    meta: { name: "Street Address" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldLocationAddress ===
          row.original.newLocationAddress ? (
            <span>{row.original.oldLocationAddress}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newLocationAddress}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "locationAddress2",
    meta: { name: "Street Address 2" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldLocationAddress2 ===
          row.original.newLocationAddress2 ? (
            <span>{row.original.oldLocationAddress2}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newLocationAddress2}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "locationCity",
    meta: { name: "City" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldLocationCity === row.original.newLocationCity ? (
            <span>{row.original.oldLocationCity}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newLocationCity}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "locationState",
    meta: { name: "State" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldLocationState === row.original.newLocationState ? (
            <span>{row.original.oldLocationState}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newLocationState}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "locationZip",
    meta: { name: "ZipCode" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldLocationZipCode ===
          row.original.newLocationZipCode ? (
            <span>{row.original.oldLocationZipCode}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newLocationZipCode}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "locationCountry",
    meta: { name: "City" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldLocationCountry ===
          row.original.newLocationCountry ? (
            <span>{row.original.oldLocationCountry}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newLocationCountry}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "latitude",
    meta: { name: "Latitude" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldLocationLat === row.original.newLocationLat ? (
            <span>{row.original.oldLocationLat}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newLocationLat}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "longitude",
    meta: { name: "Longitude" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start">
          {row.original.oldLocationLng === row.original.newLocationLng ? (
            <span>{row.original.oldLocationLng}</span>
          ) : (
            <div className="flex items-center justify-start gap-1">
              <span>{row.original.newLocationLng}</span>
              <Badge size={"sm"}>new</Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
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
                  row.original.status === "approved",
                "border-red-200 bg-red-100 text-red-700":
                  row.original.status === "rejected",
                "border-yellow-200 bg-yellow-100 text-yellow-700":
                  row.original.status === "pending",
              },
            )}
          >
            {row.original.status}
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
    accessorFn: (row) => dayjs(row.created).format("M/D/YY h:mm A"),
    meta: { name: "Created At" },
    header: Header,
    cell: Cell,
  },
];
