"use client";

import { BreakPoints, Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";

import { Responsive } from "~/utils/responsive";
import { filterStore } from "~/utils/store/filter";
import { FiltersAll } from "./filters-all";

export const MobileAllFilters = () => {
  const allFilters = filterStore.use.allFilters();
  return (
    <Responsive maxWidth={BreakPoints.LG}>
      {!allFilters ? null : (
        <div
          style={{ zIndex: Z_INDEX.MOBILE_ALL_FILTERS_CONTAINER }}
          className={cn(`absolute inset-0 bg-background`)}
        >
          <FiltersAll />
        </div>
      )}
    </Responsive>
  );
};
