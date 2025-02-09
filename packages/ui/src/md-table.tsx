"use client";

import type {
  PaginationState,
  Row,
  SortingState,
  TableOptions,
  VisibilityState,
} from "@tanstack/react-table";
import type { Table as TableType } from "@tanstack/table-core";
import React, { useImperativeHandle } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDownIcon } from "lucide-react";

import type { PartialBy } from "@f3/shared/common/types";
import { safeParseInt } from "@f3/shared/common/functions";

import { cn } from ".";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export interface PaginationOptions {
  pageSize?: number;
  pageSizeOptions?: number[];
}

export interface MDTableProps<T> {
  onRowClick?: (row: Row<T>) => void;
  rowHref?: (row: Row<T>) => string;
  isLoading?: boolean;
  data: TableOptions<T>["data"];
  columns: TableOptions<T>["columns"];
  tableOptions?: Partial<TableOptions<T>>;
  tableName?: string;
  rowsName?: string;
  downloadCSV?: (params: { table: TableType<T>; name: string }) => void;
  // https://fettblog.eu/typescript-react-generic-forward-refs/
  tableRef?: React.Ref<TableType<T>> | null;
  filterComponent?: React.ReactNode;
  cellClassName?: string;
  paginationOptions?: PaginationOptions;
  defaultSortingState?: SortingState;
  rowClassName?: (row: Row<T>) => string | undefined;
}

export const MDTable = <T,>(params: MDTableProps<T>) => {
  const {
    onRowClick,
    isLoading,
    tableRef,
    filterComponent,
    cellClassName,
    paginationOptions,
    data,
    columns,
    tableName = "table",
    rowsName = "rows",
    downloadCSV,
    defaultSortingState,
    rowClassName,
  } = params;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>(
    defaultSortingState ?? [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const { pagination, setPagination, pageSizeOptions } =
    usePagination(paginationOptions);

  const table = useReactTable<T>({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
      sorting,
      columnVisibility,
      globalFilter: searchTerm,
    },
  });

  useImperativeHandle(tableRef, () => table);

  return (
    <>
      <div className="mt-4 flex flex-row items-center justify-between py-4">
        <div className="flex flex-1 items-center gap-4">
          <Input
            placeholder={`Search ${rowsName}...`}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
            className="max-w-60"
          />
          <div>
            Showing {table.getRowModel().rows?.length ?? 0} /{" "}
            {table.getRowCount().toLocaleString()} {rowsName}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {downloadCSV ? (
            <button
              className="text-blue-600 underline"
              onClick={() => downloadCSV?.({ table, name: tableName })}
            >
              Download CSV
            </button>
          ) : null}
          {filterComponent ? filterComponent : null}
        </div>
        <div className="ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from(Array(pagination.pageSize)).map((_, index) => (
                <TableRow
                  key={index}
                  className={cn(`hover:bg-gray-300`, {
                    "bg-gray-200": index % 2 === 0,
                  })}
                >
                  {table.getAllColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-6" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    `hover:bg-gray-300`,
                    { "hover:cursor-pointer": !!onRowClick },
                    { "bg-gray-200": index % 2 === 0 },
                    rowClassName?.(row),
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(cellClassName)}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {pagination ? (
          <div className="flex items-center justify-between px-5 py-5">
            {table.getRowCount() > pagination.pageSize ? (
              <div className="flex flex-row items-center gap-2">
                <Button
                  variant="ghost"
                  className="w-8 rounded border p-1"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  {"<<"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-8 rounded border p-1"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {"<"}
                </Button>
                <span className="flex items-center gap-1">
                  <div>Page</div>
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </strong>
                </span>
                <Button
                  variant="ghost"
                  className="w-8 rounded border p-1"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {">"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-8 rounded border p-1"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  {">>"}
                </Button>
              </div>
            ) : (
              <div />
            )}
            {/* ability to select the size of the page */}
            {table.getRowCount() > pagination.pageSize ? (
              <div className="flex flex-row items-center gap-2">
                <div className="pointer-events-none flex-shrink-0">
                  Page size
                </div>
                <Select
                  value={pagination.pageSize.toString()}
                  onValueChange={(value) => {
                    const pageSize = safeParseInt(value);
                    if (pageSize !== undefined) {
                      table.setPageSize(pageSize);
                    }
                  }}
                >
                  <SelectTrigger className="mr-2 rounded-md bg-transparent px-1 focus:ring-0">
                    <SelectValue>
                      <strong>{pagination.pageSize}</strong>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-10" position="popper">
                    {pageSizeOptions.map((size) => (
                      <SelectItem
                        key={size}
                        className="flex cursor-pointer justify-center rounded-md px-4 py-1 text-lg font-semibold hover:bg-emerald-100"
                        value={size.toString()}
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
};

const usePagination = (params?: PaginationOptions) => {
  const pageSizeOptions = params?.pageSizeOptions ?? [10, 20, 50, 100];
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: params?.pageSize ?? 10,
    });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  return { pagination, setPagination, pageSizeOptions };
};

export type MdTableOptions<T> = Pick<TableOptions<T>, "data" | "columns"> &
  Partial<TableOptions<T>> & {
    tableName: string;
    rowsName: string;
    downloadCSV?: (params: { table: TableType<T>; name: string }) => void;
  };

// Type helper
export const createTableOptions = <T,>(
  params: PartialBy<MdTableOptions<T>, "tableName" | "rowsName">,
): MdTableOptions<T> => {
  return {
    data: params.data,
    columns: params.columns,
    tableName: params.tableName ?? "table",
    rowsName: params.rowsName ?? "rows",
    downloadCSV: params.downloadCSV,
  };
};
