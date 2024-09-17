"use client";

import { cn } from "@f3/ui";

import { filterStore } from "~/utils/store/filter";
import { DesktopNearbyLocations } from "../map/desktop-nearby-locations";
import { FiltersAll } from "../map/filters-all";
import { FiltersSome } from "../map/filters-some";

export const Sidebar = () => {
  const allFilters = filterStore.use.allFilters();
  return (
    <>
      <div className="flex w-full flex-row justify-center">
        <FiltersSome />
      </div>
      <FiltersAll className={cn({ hidden: !allFilters })} />
      <DesktopNearbyLocations className={cn({ hidden: allFilters })} />
    </>
  );
};
