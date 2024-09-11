"use client";

import { BreakPoints } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { useTheme } from "@f3/ui/theme";

import { Responsive } from "~/utils/responsive";
import { filterStore } from "~/utils/store/filter";
import AllFiltersSvgComponent from "../SVGs/allFilters";

export const MobileFilterButton = () => {
  const { resolvedTheme } = useTheme();

  return (
    <Responsive maxWidth={BreakPoints.LG}>
      <div
        className="absolute right-2 top-2"
        style={{
          zIndex: 1000,
        }}
      >
        <button
          className={cn(
            "pointer-events-auto flex size-[36px] items-center justify-center rounded-md bg-background text-black shadow",
            "hover:bg-accent",
          )}
          onClick={(e) => {
            filterStore.setState({ allFilters: true });
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <AllFiltersSvgComponent
            fillcolor={resolvedTheme === "dark" ? "white" : "black"}
            width={20}
            height={20}
          />
        </button>
      </div>
    </Responsive>
  );
};
