"use client";

import dynamic from "next/dynamic";

import { filterStore } from "~/utils/store/filter";
import { DrawerAllFilters } from "./drawer-all-filters";
import { SearchResultItemSkeleton } from "./search-result-item-skeleton";

const DrawerSearchResultsClient = dynamic(
  () =>
    import("./drawer-search-results").then((mod) => mod.DrawerSearchResults),
  {
    ssr: false,
    loading: () => (
      <div>
        {Array.from({ length: 6 }).map((_, index) => (
          <SearchResultItemSkeleton key={index} />
        ))}
      </div>
    ),
  },
);

export const DrawerFilterWrapper = () => {
  const allFilters = filterStore.use.allFilters();

  if (allFilters) {
    return <DrawerAllFilters />;
  }

  return <DrawerSearchResultsClient />;
};
