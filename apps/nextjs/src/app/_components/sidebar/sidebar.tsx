"use client";

import { cn } from "@f3/ui";

import { filterStore } from "~/utils/store/filter";
import { DrawerAllFilters } from "../map/drawer-all-filters";
import { DrawerSearchResults } from "../map/drawer-search-results";
import { DrawerSomeFilters } from "../map/drawer-some-filters";

export const Sidebar = () => {
  const allFilters = filterStore.use.allFilters();
  return (
    <>
      <div className="flex w-full flex-row justify-center">
        <DrawerSomeFilters />
      </div>
      <DrawerAllFilters className={cn({ hidden: !allFilters })} />
      <DrawerSearchResults className={cn({ hidden: allFilters })} />
    </>
  );
};
