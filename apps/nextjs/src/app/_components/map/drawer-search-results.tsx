"use client";

import type { ComponentProps } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

import { VersionInfo } from "../version-info";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import SearchResultItem from "./search-result-item";
import { SearchResultItemSkeleton } from "./search-result-item-skeleton";

export const DrawerSearchResults = ({
  className,
  ...rest
}: ComponentProps<"div">) => {
  RERENDER_LOGS && console.log("DrawerSearchResults rerender");
  const { locationOrderedLocationMarkers, isLoading } = useFilteredMapResults();

  return (
    <>
      <div
        className={cn(
          "flex flex-1 flex-wrap justify-center divide-y divide-solid overflow-scroll",
          className,
        )}
        {...rest}
      >
        {!isLoading && !!locationOrderedLocationMarkers
          ? locationOrderedLocationMarkers
              ?.slice(0, 10)
              .map((result) => (
                <SearchResultItem key={result.id} searchResult={result} />
              ))
          : Array.from({ length: 6 }).map((_, index) => (
              <SearchResultItemSkeleton key={index} />
            ))}
      </div>
      <VersionInfo className=" w-full text-center text-xs" />
    </>
  );
};
