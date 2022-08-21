import { ZustandStore } from "@f3/shared/common/classes";

export type TimeSelection =
  | "none"
  | "12am"
  | "1am"
  | "2am"
  | "3am"
  | "4am"
  | "5am"
  | "6am"
  | "7am"
  | "8am"
  | "9am"
  | "10am"
  | "11am";

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
  beforeAfterTime: "none" as TimeSelection,
  CSAUPs: false,
  Convergence: false,
  GTE: false,
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
