"use client";

import type { ComponentProps } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";
import { Skeleton } from "@f3/ui/skeleton";

import { VersionInfo } from "../version-info";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import SearchResultItem from "./search-result-item";

export const DrawerSearchResults = ({
  className,
  ...rest
}: ComponentProps<"div">) => {
  RERENDER_LOGS && console.log("DrawerSearchResults rerender");
  const { locationOrderedLocationMarkers } = useFilteredMapResults();

  return (
    <>
      <div
        className={cn(
          "flex flex-1 flex-wrap justify-center divide-y divide-solid overflow-scroll",
          className,
        )}
        {...rest}
      >
        {locationOrderedLocationMarkers === undefined
          ? Array.from({ length: 6 }).map((_, index) => (
              <SearchResultItemSkeleton key={index} />
            ))
          : locationOrderedLocationMarkers
              ?.slice(0, 10)
              .map((result) => (
                <SearchResultItem key={result.id} selectedLocation={result} />
              ))}
      </div>
      <VersionInfo className=" w-full text-center text-xs" />
    </>
  );
};

const SearchResultItemSkeleton = () => {
  return (
    <Skeleton className="flex min-h-[160px] w-full flex-col justify-between bg-transparent p-4">
      <div className="flex flex-row justify-between">
        <Skeleton className="h-[30px] w-[120px]" />
        <Skeleton className="h-[10px] w-[20px]" />
      </div>
      <div className="flex flex-row pt-2">
        <div className="flex w-[80px] flex-col items-center justify-start gap-1">
          <Skeleton className="h-[48px] w-[48px]" />
          <Skeleton className="h-[10px] w-[48px]" />
          <Skeleton className="h-[10px] w-[48px]" />
        </div>

        <div className="flex w-full flex-col gap-1">
          <Skeleton className="h-[24px] w-[120px]" />
          <Skeleton className="h-[16px] w-full" />
          <Skeleton className="h-[32px] w-full" />
        </div>
      </div>
    </Skeleton>
  );
};
