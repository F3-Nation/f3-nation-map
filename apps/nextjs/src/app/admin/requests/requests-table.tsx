"use client";

import type { TableOptions } from "@tanstack/react-table";
import { useState } from "react";
import dayjs from "dayjs";

import type { RouterOutputs } from "@acme/api";
import type { SortingSchema } from "@acme/validators";
import { cn } from "@acme/ui";
import { MDTable, usePagination } from "@acme/ui/md-table";
import { Cell, Header } from "@acme/ui/table";

import { api } from "~/trpc/react";
import { ModalType, openModal } from "~/utils/store/modal";

export const RequestsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingSchema>([]);
  const { pagination, setPagination } = usePagination();
  const { data: requests } = api.request.all.useQuery({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    searchTerm: searchTerm,
    sorting: sorting,
  });
  return (
    <MDTable
      data={requests?.requests}
      cellClassName="p-1"
      paginationOptions={{ pageSize: 20 }}
      totalCount={requests?.totalCount}
      columns={columns}
      onRowClick={(row) => {
        if (row.original.requestType === "delete_event") {
          openModal(ModalType.ADMIN_DELETE_REQUEST, { id: row.original.id });
        } else {
          openModal(ModalType.ADMIN_REQUESTS, { id: row.original.id });
        }
      }}
      rowClassName={(row) =>
        `${row.original.status !== "pending" ? "opacity-30" : ""} ${
          row.original.requestType === "delete_event" ? "bg-red-100" : ""
        }`
      }
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      pagination={pagination}
      setPagination={setPagination}
      sorting={sorting}
      setSorting={setSorting}
    />
  );
};

const columns: TableOptions<
  RouterOutputs["request"]["all"]["requests"][number]
>["columns"] = [
  {
    accessorKey: "status",
    meta: { name: "Status" },
    header: Header,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start gap-1">
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
    accessorKey: "requestType",
    meta: { name: "Request Type" },
    header: Header,
    cell: ({ row }) => {
      const requestTypeText =
        row.original.requestType === "delete_event"
          ? "Delete Event"
          : row.original.requestType === "create_event"
            ? "Create Event"
            : row.original.requestType === "create_location"
              ? "Create Location"
              : row.original.requestType === "edit"
                ? "Edit"
                : row.original.requestType;
      return (
        <div className="flex items-center justify-start gap-1">
          <p>{requestTypeText}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "regionName",
    meta: { name: "Region" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldRegionName !== row.original.newRegionName &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newRegionName}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldRegionName}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "aoName",
    meta: { name: "Location / AO Name" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldAoName !== row.original.newAoName &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newAoName}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldAoName}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "workoutName",
    meta: { name: "Workout" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldWorkoutName !== row.original.newWorkoutName &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newWorkoutName}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldWorkoutName}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "dayOfWeek",
    meta: { name: "Day of Week" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldDayOfWeek !== row.original.newDayOfWeek &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newDayOfWeek}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldDayOfWeek}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "startTime",
    meta: { name: "Start Time" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldStartTime !== row.original.newStartTime &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newStartTime}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldStartTime}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },

  {
    accessorKey: "endTime",
    meta: { name: "End Time" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldEndTime !== row.original.newEndTime &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newEndTime}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldEndTime}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    meta: { name: "Description" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldDescription !== row.original.newDescription &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newDescription}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldDescription}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "locationAddress",
    meta: { name: "Street Address" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldLocationAddress !== row.original.newLocationAddress &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newLocationAddress}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldLocationAddress}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "locationAddress2",
    meta: { name: "Street Address 2" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldLocationAddress2 !== row.original.newLocationAddress2 &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newLocationAddress2}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldLocationAddress2}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "locationCity",
    meta: { name: "City" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldLocationCity !== row.original.newLocationCity &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newLocationCity}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldLocationCity}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "locationState",
    meta: { name: "State" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldLocationState !== row.original.newLocationState &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newLocationState}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldLocationState}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "locationZip",
    meta: { name: "ZipCode" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldLocationZipCode !== row.original.newLocationZipCode &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newLocationZipCode}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldLocationZipCode}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },

  {
    accessorKey: "locationCountry",
    meta: { name: "City" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldLocationCountry !== row.original.newLocationCountry &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newLocationCountry}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldLocationCountry}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "latitude",
    meta: { name: "Latitude" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldLocationLat !== row.original.newLocationLat &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newLocationLat}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldLocationLat}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "longitude",
    meta: { name: "Longitude" },
    header: Header,
    cell: ({ row }) => {
      const isAnUpdate =
        row.original.oldLocationLng !== row.original.newLocationLng &&
        row.original.status === "pending";
      return (
        <div className="flex items-center justify-start gap-1">
          <div className="flex flex-col gap-1">
            <p>{row.original.newLocationLng}</p>
            {isAnUpdate ? (
              <p className="line-through">{row.original.oldLocationLng}</p>
            ) : null}
          </div>
          {isAnUpdate ? <CircleBadge /> : null}
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
        <div className="flex items-center justify-start gap-1">
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

const CircleBadge = () => {
  return (
    <div className="flex items-center justify-start">
      <div className="size-3 rounded-full bg-red-500" />
    </div>
  );
};
