import type { PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

const usePagination = (params?: {
  pageSize?: number;
  pageSizeOptions?: number[];
}) => {
  const pageSizeOptions = params?.pageSizeOptions ?? [10, 20, 50, 100];
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: params?.pageSize ?? 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  return { pagination, setPagination, pageSizeOptions };
};

export default usePagination;
