"use client";

import { BreakPoints } from "@f3/shared/app/constants";

import { Responsive } from "~/utils/responsive";
import { filterStore } from "~/utils/store/filter";
import { FiltersAll } from "./filters-all";

export const MobileAllFilters = () => {
  const allFilters = filterStore.use.allFilters();
  return (
    <Responsive maxWidth={BreakPoints.LG}>
      {!allFilters ? null : (
        <div className="absolute inset-0 z-[2001] bg-background">
          <FiltersAll />
        </div>
      )}
    </Responsive>
  );
};
