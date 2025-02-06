// filteredData.ts

import isWithinRadius from "@f3/shared/app/functions";
import { isTruthy } from "@f3/shared/common/functions";

import type { FiltersType } from "./store/filter";
import type { LocationMarkerWithDistance } from "~/app/_components/map/filtered-map-results-provider";
import { dayjs } from "./frontendDayjs";
import { filterStore, TimeSelection } from "./store/filter";
import { mapStore } from "./store/map";

export const filterData = <
  T extends {
    events: {
      dayOfWeek: number | null;
      startTime: string | null;
      types: { id: number; name: string }[];
    }[];
  },
>(
  allLocationMarkers: T[],
  filters: FiltersType,
): T[] => {
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
        // filters.todayVar,
        // filters.tomorrowVar,
      ].every((f) => f === false);

      const specificDayFilterMatch = [
        filters.daySu && event.dayOfWeek === 0,
        filters.dayM && event.dayOfWeek === 1,
        filters.dayTu && event.dayOfWeek === 2,
        filters.dayW && event.dayOfWeek === 3,
        filters.dayTh && event.dayOfWeek === 4,
        filters.dayF && event.dayOfWeek === 5,
        filters.daySa && event.dayOfWeek === 6,
        // filters.today && event.dayOfWeek === currentDay,
        // filters.tomorrow && event.dayOfWeek === getNextDay(currentDay),
      ].some((f) => f === true);

      const includeThisLocationMarkerOnDays =
        noDayFilters || specificDayFilterMatch;

      const startDayjs = dayjs(event.startTime, "HH:mm:ss");
      const startIsAM = startDayjs.format("a") === "am";
      const includeThisLocationMarkerOnAmPm =
        (!filters.am || startIsAM) && (!filters.pm || !startIsAM);

      // Check if at least one of the selected type filters matches the station's type
      const includeThisLocationMarkerOnType =
        (!filters.Bootcamp ||
          event.types.some((type) => type.name === "Bootcamp")) &&
        (!filters.Run || event.types.some((type) => type.name === "Run")) &&
        (!filters.Ruck || event.types.some((type) => type.name === "Ruck")) &&
        (!filters.Swim ||
          event.types.some((type) => type.name === "Swimming")) &&
        (!filters.CSAUPs ||
          event.types.some((type) => type.name === "CSAUPs")) &&
        (!filters.Convergence ||
          event.types.some((type) => type.name === "Convergence")) &&
        (!filters.GTE || event.types.some((type) => type.name === "GTE"));

      // // Check if the after time filter matches the station's end time
      let includeThisLocationMarkerOnTime = true;
      if (filters.beforeAfterTime !== TimeSelection.none) {
        const hour = filters.beforeAfterTime.slice(0, -2);
        const period = filters.beforeAfterTime.slice(-2);
        // const [hour, period] = filters.beforeAfterTime
        //   .split(/(\d+)/)
        //   .filter(Boolean);
        let filterTime = parseInt(hour ?? "0", 10);
        const stationStartTime = parseInt(
          event.startTime?.split(":")?.[0] ?? "0",
          10,
        );

        if (period === "pm" && filterTime !== 12) {
          filterTime += 12;
        }

        if (
          filters.beforeAfterDirection === "before"
            ? stationStartTime > filterTime
            : stationStartTime < filterTime
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

export const filterDataWithinMiles = ({
  data,
  miles = 20,
}: {
  data: LocationMarkerWithDistance[] | undefined;
  miles?: number;
}) => {
  if (!data) {
    return [];
  }

  const filteredLocationMarkers = data.map((locationMarker) => {
    let location = mapStore?.get("userGpsLocation");
    const filterPosition = filterStore?.get("position");

    if (filterPosition) {
      location = {
        latitude: filterPosition.latitude,
        longitude: filterPosition.longitude,
      };
    }

    const includeThisLocationMarkerOnRadius = isWithinRadius({
      miles,
      checkPosition: {
        lat: locationMarker.lat ?? 0,
        long: locationMarker.lon ?? 0,
      },
      basePosition: {
        lat: location?.latitude ?? 0,
        long: location?.longitude ?? 0,
      },
    });

    return includeThisLocationMarkerOnRadius;
  });

  return filteredLocationMarkers.filter(isTruthy);
};

export const getNextDay = (currentDay: number) => {
  return currentDay === 6 ? 0 : currentDay + 1;
};
