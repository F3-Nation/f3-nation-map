"use client";

import type { ComponentProps } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

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
          "flex flex-wrap justify-center divide-y divide-solid overflow-scroll",
          className,
        )}
        {...rest}
      >
        {locationOrderedLocationMarkers
          ?.slice(0, 10)
          .map((result) => (
            <SearchResultItem key={result.id} selectedLocation={result} />
          ))}
      </div>
      <VersionInfo className=" w-full text-center text-xs" />
    </>
  );
};
