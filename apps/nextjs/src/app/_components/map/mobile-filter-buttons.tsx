"use client";

import { CalendarIcon } from "lucide-react";

import { BreakPoints } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { useTheme } from "@f3/ui/theme";

import { Responsive } from "~/utils/responsive";
import { filterStore, isAnyFilterActive } from "~/utils/store/filter";
import AllFiltersSvgComponent from "../SVGs/allFilters";

export const MobileFilterButtons = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tomorrow = filterStore.use.tomorrow();
  const filters = filterStore.useBoundStore();
  // Remove tomorrow since we have a separate button for it
  const isFilterActive = isAnyFilterActive({ ...filters, tomorrow: false });

  return (
    <Responsive maxWidth={BreakPoints.LG}>
      <div
        className="absolute right-2 top-2 flex flex-col gap-2"
        style={{ zIndex: 1000 }}
      >
        <button
          className={cn(
            "pointer-events-auto flex size-[36px] items-center justify-center rounded-md text-black shadow",
            { "border-gray-300 bg-gray-300": isFilterActive && isDark },
            { "border-gray-600 bg-gray-600": isFilterActive && !isDark },
            { "border-gray-400 bg-background": !isFilterActive },
          )}
          onClick={(e) => {
            filterStore.setState({ allFilters: true });
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <AllFiltersSvgComponent
            fillcolor={
              isFilterActive
                ? isDark
                  ? "#000000"
                  : "#FFFFFF"
                : isDark
                  ? "#FFFFFF"
                  : "#4b5563"
            }
            width={18}
            height={18}
          />
        </button>
        <button
          className={cn(
            "pointer-events-auto relative flex size-[36px] items-center justify-center rounded-md text-black shadow",
            { "border-gray-300 bg-gray-300": tomorrow && isDark },
            { "border-gray-600 bg-gray-600": tomorrow && !isDark },
            { "border-gray-400 bg-background": !tomorrow },
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
            width={22}
            height={22}
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
