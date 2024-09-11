"use client";

import type { ComponentProps } from "react";
import Image from "next/image"; // Next.js Image component for optimized image rendering.
import { X } from "lucide-react";

import { SHORT_DAY_ORDER } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";
import { useTheme } from "@f3/ui/theme";

import type { FiltersType, TimeSelection } from "~/utils/store/filter";
import { filterStore, initialFilterState } from "~/utils/store/filter";
import BootSvgComponent from "../SVGs/boot-camp";
import ConvergenceSvgComponent from "../SVGs/convergence";
import csaupSvgComponent from "../SVGs/csaup";
import gteSvgComponent from "../SVGs/gte";
import RuckSvgComponent from "../SVGs/ruck";
import RunSvgComponent from "../SVGs/run";
import SwimSvgComponent from "../SVGs/swim";

// Defining items for the filter options with their names and corresponding SVG components or image paths.

// The main component for the map drawer.
export const DrawerAllFilters = (props: ComponentProps<"div">) => {
  RERENDER_LOGS && console.log("DrawerAllFilters rerender");
  const { className, ...rest } = props;
  const filters = filterStore.useBoundStore();
  console.log("DrawerAllFilters filters", filters.dayW);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Function to toggle the state of a filter when clicked.
  const handleFilterClick = (
    filterName: keyof FiltersType,
    newState?: boolean,
  ) => {
    console.log("DrawerAllFilters handleFilterClick", filterName);
    if (filterName === "allFilters") {
      filterStore.setState((s) => ({ allFilters: !s.allFilters }));
    } else {
      filterStore.setState((s) => ({
        [filterName]: newState ?? !s[filterName],
      }));
    }
  };

  const handleTypeClick = (
    filterName: "Bootcamp" | "Ruck" | "Run" | "Swim",
    newState?: boolean,
  ) => {
    console.log("DrawerAllFilters handleTypeClick", filterName);
    filterStore.setState((s) => ({
      Bootcamp: false,
      Ruck: false,
      Run: false,
      Swim: false,
      [filterName]: newState ?? !s[filterName],
    }));
  };

  const handleEventClick = (
    filterName: keyof FiltersType,
    newState?: boolean,
  ) => {
    console.log("DrawerAllFilters handleEventClick", filterName);
    if (filterName === "allFilters") {
      filterStore.setState((s) => ({ allFilters: !s.allFilters }));
    } else {
      filterStore.setState((s) => ({
        Bootcamp: false,
        Ruck: false,
        Run: false,
        Swim: false,
        [filterName]: newState ?? !s[filterName],
      }));
    }
  };

  const handleResetFilters = () => {
    console.log("DrawerAllFilters handleResetFilters");
    filterStore.setState(initialFilterState);
  };

  const workoutItems = [
    {
      name: "Bootcamp" as const,
      img: BootSvgComponent,
      onClick: () => {
        handleTypeClick("Bootcamp");
      },
    },
    {
      name: "Ruck" as const,
      img: RuckSvgComponent,
      onClick: () => {
        handleTypeClick("Ruck");
      },
    },
    {
      name: "Run" as const,
      img: RunSvgComponent,
      onClick: () => {
        handleTypeClick("Run");
      },
    },
    {
      name: "Swim" as const,
      img: SwimSvgComponent,
      onClick: () => {
        handleTypeClick("Swim");
      },
    },
  ];

  const eventItems = [
    {
      name: "CSAUPs" as const,
      img: csaupSvgComponent,
      onClick: () => {
        handleEventClick("CSAUPs");
      },
    },
    {
      name: "Convergence" as const,
      img: ConvergenceSvgComponent,
      onClick: () => {
        handleEventClick("Convergence");
      },
    },
    {
      name: "GTE" as const,
      img: gteSvgComponent,
      onClick: () => {
        handleEventClick("GTE");
      },
    },
  ];

  return (
    <div {...rest} className={cn(className)}>
      <div className="mt-4">
        {/* grid where edges are small */}
        <div className="grid grid-cols-3 px-4">
          <div />
          <h2 className="text-center text-lg font-bold">Map Filters</h2>
          <div className="flex flex-row items-center justify-end gap-2">
            <button
              className="justify-self-center text-gray-500"
              onClick={handleResetFilters}
            >
              Reset
            </button>
            <button
              className="pointer-events-auto"
              onClick={() => handleFilterClick("allFilters")}
            >
              <div className="rounded-full border-[1px] border-black">
                <X />
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex h-full flex-col gap-4 overflow-auto px-6">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Day of Workout</h3>
          <div className="grid grid-cols-7 gap-2">
            {SHORT_DAY_ORDER.map((day, index) => (
              <button
                key={index}
                className={cn(
                  {
                    "border-blue-500 bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300":
                      filters[`day${day}`],
                    "border-gray-300 bg-background text-gray-500 dark:border-gray-700 dark:text-gray-400":
                      !filters[`day${day}`],
                  },
                  `rounded-lg border px-2 py-1`,
                )}
                onClick={() => handleFilterClick(`day${day}`)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Time of Workout</h2>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-4">
              <select
                data-vaul-no-drag
                className="w-40 rounded border border-gray-300 px-2 py-1"
                value={filters.beforeAfterDirection}
                onChange={(e) => {
                  filterStore.setState({
                    beforeAfterDirection: e.target.value as "before" | "after",
                  });
                }}
              >
                <option value="before">Before</option>
                <option value="after">After</option>
              </select>
              <select
                data-vaul-no-drag
                className={cn("w-40 rounded border border-gray-300 px-2 py-1", {
                  "border-blue-500 bg-blue-100":
                    filters.beforeAfterTime !== "none",
                })}
                value={filters.beforeAfterTime}
                onChange={(e) => {
                  filterStore.setState({
                    beforeAfterTime: e.target.value as TimeSelection,
                  });
                }}
              >
                <option value="none">--</option>
                <option value="12am">12 AM</option>
                <option value="1am">1 AM</option>
                <option value="2am">2 AM</option>
                <option value="3am">3 AM</option>
                <option value="4am">4 AM</option>
                <option value="5am">5 AM</option>
                <option value="6am">6 AM</option>
                <option value="7am">7 AM</option>
                <option value="8am">8 AM</option>
                <option value="9am">9 AM</option>
                <option value="10am">10 AM</option>
                <option value="11am">11 AM</option>
                <option value="12pm">12 PM</option>
                <option value="1pm">1 PM</option>
                <option value="2pm">2 PM</option>
                <option value="3pm">3 PM</option>
                <option value="4pm">4 PM</option>
                <option value="5pm">5 PM</option>
                <option value="6pm">6 PM</option>
                <option value="7pm">7 PM</option>
                <option value="8pm">8 PM</option>
                <option value="9pm">9 PM</option>
                <option value="10pm">10 PM</option>
                <option value="11pm">11 PM</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Type of Workout</h2>
          <div className="grid grid-cols-4">
            {workoutItems.map((item, index) => (
              <button
                key={index}
                className="flex flex-col items-center space-y-2"
                onClick={item.onClick ?? (() => handleFilterClick(item.name))}
              >
                <div
                  className={`rounded-lg border p-4 ${
                    filters[item.name]
                      ? isDark
                        ? "border-blue-500 bg-blue-900"
                        : "border-blue-500 bg-blue-100"
                      : "border-gray-300 bg-background"
                  }`}
                >
                  <div className="flex h-6 w-6 items-center justify-center">
                    {typeof item.img === "string" ? (
                      <Image
                        className="max-h-full w-auto object-contain"
                        src={item.img}
                        alt={item.name}
                      />
                    ) : (
                      <item.img
                        className="h-full w-full"
                        fillcolor={filters[item.name] ? "#3B82F6" : "#6B7280"}
                      />
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground">{item.name}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Events</h2>
          <div className="grid grid-cols-3 gap-4">
            {eventItems.map((item, index) => (
              <button
                key={index}
                className="flex flex-col items-center space-y-2"
                onClick={item.onClick ?? (() => handleFilterClick(item.name))}
              >
                <div
                  className={`rounded-lg border p-4 ${
                    filters[item.name]
                      ? isDark
                        ? "border-blue-500 bg-blue-900"
                        : "border-blue-500 bg-blue-100"
                      : "border-gray-300 bg-background"
                  }`}
                >
                  <div className="flex h-6 w-6 items-center justify-center">
                    {typeof item.img === "string" ? (
                      <Image
                        className="max-h-full w-auto object-contain"
                        src={item.img}
                        alt={item.name}
                      />
                    ) : (
                      <item.img
                        className="h-full w-full"
                        fillcolor={filters[item.name] ? "#3B82F6" : "#6B7280"}
                      />
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground">{item.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
