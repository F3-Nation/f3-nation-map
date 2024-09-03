// filteredData.ts

import { isTruthy } from "@f3/shared/common/functions";

import type { FiltersType } from "./store/filter";
import type { RouterOutputs } from "~/trpc/types";
import { dayjs } from "./frontendDayjs";

export const filterData = (
  allLocationMarkers: RouterOutputs["location"]["getAllLocationMarkers"],
  filters: FiltersType,
): RouterOutputs["location"]["getAllLocationMarkers"] => {
  const currentDay = dayjs().day();

  console.log("currentDay", currentDay);
  const filteredLocationMarkers = allLocationMarkers.map((locationMarker) => {
    const filteredEvents = locationMarker.events.filter((event) => {
      // Check if at least one of the selected day filters matches the station's day

      const noDayFilters = [
        filters.daySu,
        filters.dayM,
        filters.dayTu,
        filters.dayW,
        filters.dayTh,
        filters.dayF,
        filters.daySa,
        filters.today,
        filters.tomorrow,
      ].every((f) => f === false);

      const specificDayFilterMatch = [
        filters.daySu && event.dayOfWeek === 0,
        filters.dayM && event.dayOfWeek === 1,
        filters.dayTu && event.dayOfWeek === 2,
        filters.dayW && event.dayOfWeek === 3,
        filters.dayTh && event.dayOfWeek === 4,
        filters.dayF && event.dayOfWeek === 5,
        filters.daySa && event.dayOfWeek === 6,
        filters.today && event.dayOfWeek === currentDay,
        filters.tomorrow && event.dayOfWeek === getNextDay(currentDay),
      ].some((f) => f === true);

      const includeThisLocationMarkerOnDays =
        noDayFilters || specificDayFilterMatch;

      const startDayjs = dayjs(event.startTime, "HH:mm:ss");
      const startIsAM = startDayjs.format("a") === "am";
      const includeThisLocationMarkerOnAmPm =
        (!filters.am || startIsAM) && (!filters.pm || !startIsAM);

      // Check if at least one of the selected type filters matches the station's type
      const includeThisLocationMarkerOnType =
        (!filters.Bootcamp || event.type === "Bootcamp") &&
        (!filters.Ruck || event.type === "Ruck") &&
        (!filters.Swim || event.type === "Swimming") &&
        (!filters.CSAUPs || event.type === "CSAUPs") &&
        (!filters.Convergence || event.type === "Convergence") &&
        (!filters.GTE || event.type === "GTE");

      // // Check if the after time filter matches the station's end time
      let includeThisLocationMarkerOnTime = true;
      if (filters.beforeAfterTime !== "none") {
        const [hour, period] = filters.beforeAfterTime
          .split(/(\d+)/)
          .filter(Boolean);
        let filterTime = parseInt(hour ?? "0", 10);
        const stationEndTime = parseInt(
          event.startTime?.split(":")?.[0] ?? "0",
          10,
        );

        if (period === "pm" && filterTime !== 12) {
          filterTime += 12;
        }

        if (
          filters.beforeAfterDirection === "before"
            ? stationEndTime > filterTime
            : stationEndTime < filterTime
        ) {
          includeThisLocationMarkerOnTime = false;
        }
      }

      return (
        includeThisLocationMarkerOnDays &&
        includeThisLocationMarkerOnAmPm &&
        includeThisLocationMarkerOnType &&
        includeThisLocationMarkerOnTime
      );
    });

    return filteredEvents.length === 0
      ? null
      : {
          ...locationMarker,
          events: filteredEvents,
        };
  });

  return filteredLocationMarkers.filter(isTruthy);
};

export const getNextDay = (currentDay: number) => {
  return currentDay === 6 ? 0 : currentDay + 1;
};
