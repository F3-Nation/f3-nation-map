"use client";

import { CalendarIcon, Filter } from "lucide-react";

import { BreakPoints, Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { useTheme } from "@f3/ui/theme";

import { Responsive } from "~/utils/responsive";
import { filterStore, isAnyFilterActive } from "~/utils/store/filter";

export const MobileFilterButtons = () => {
  const tomorrow = filterStore.use.tomorrow();
  const filters = filterStore.useBoundStore();
  // Remove tomorrow since we have a separate button for it
  const isFilterActive = isAnyFilterActive({ ...filters, tomorrow: false });

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Responsive maxWidth={BreakPoints.LG}>
      <div
        className="absolute right-2 top-2 flex flex-col gap-2"
        style={{ zIndex: Z_INDEX.MOBILE_FILTER_BUTTONS }}
      >
        <button
          className={cn(
            "pointer-events-auto flex size-[36px] items-center justify-center rounded-md bg-white text-foreground shadow",
            isDark ? "bg-black" : "bg-white",
            { "bg-muted-foreground": isFilterActive },
          )}
          onClick={(e) => {
            filterStore.setState({ allFilters: true });
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <Filter
            strokeWidth={1.25}
            className={cn("size-6", { "text-background": isFilterActive })}
          />
        </button>
        <button
          className={cn(
            "pointer-events-auto relative flex size-[36px] items-center justify-center rounded-md bg-white text-foreground shadow",
            isDark ? "bg-black" : "bg-white",
            { "bg-muted-foreground": tomorrow },
          )}
          onClick={(e) => {
            filterStore.setState((fs) => ({ tomorrow: !fs.tomorrow }));
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <CalendarIcon
            strokeWidth={1.25}
            className={cn("size-6", { "text-background": tomorrow })}
          />
          <div
            className={cn("absolute top-[16px] text-[8px] font-semibold", {
              "text-background": tomorrow,
            })}
          >
            +1
          </div>
        </button>
      </div>
    </Responsive>
  );
};
