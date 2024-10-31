import { ZustandStore } from "@f3/shared/common/classes";

export enum TimeSelection {
  none = "none",
  "12am" = "12am",
  "1am" = "1am",
  "2am" = "2am",
  "3am" = "3am",
  "4am" = "4am",
  "5am" = "5am",
  "6am" = "6am",
  "7am" = "7am",
  "8am" = "8am",
  "9am" = "9am",
  "10am" = "10am",
  "11am" = "11am",
  "12pm" = "12pm",
  "1pm" = "1pm",
  "2pm" = "2pm",
  "3pm" = "3pm",
  "4pm" = "4pm",
  "5pm" = "5pm",
  "6pm" = "6pm",
  "7pm" = "7pm",
  "8pm" = "8pm",
  "9pm" = "9pm",
  "10pm" = "10pm",
  "11pm" = "11pm",
}

export const initialFilterState = {
  today: false,
  tomorrow: false,
  am: false,
  pm: false,
  allFilters: false,
  daySu: false,
  dayM: false,
  dayTu: false,
  dayW: false,
  dayTh: false,
  dayF: false,
  daySa: false,
  Bootcamp: false,
  Ruck: false,
  Swim: false,
  Run: false,
  beforeAfterDirection: "before" as "before" | "after",
  beforeAfterTime: TimeSelection.none,
  CSAUPs: false,
  Convergence: false,
  GTE: false,
  position: { latitude: 0, longitude: 0 },
};

export type FiltersType = typeof initialFilterState;

export const filterStore = new ZustandStore({
  initialState: initialFilterState,
  persistOptions: {
    name: "filter-store",
    version: 1,
    persistedKeys: [],
    getStorage: () => localStorage,
  },
});

export const isAnyFilterActive = (filters: FiltersType) => {
  const {
    am: _am,
    pm: _pm,
    today: _today,
    tomorrow: _tomorrow,
    beforeAfterTime,
    ...otherFilters
  } = filters;
  return (
    Object.values(otherFilters).some((value) => value === true) ||
    beforeAfterTime !== TimeSelection.none
  );
};
