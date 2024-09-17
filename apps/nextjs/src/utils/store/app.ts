import { createRef } from "react";

import { ZustandStore } from "@f3/shared/common/classes";

const initialState = {
  // selectedItem: null as (GroupedMapData & WorkoutData) | null,
  shadCnContainterRef: createRef<HTMLDivElement>(),
  ignoreNextNearbyItemMouseEnter: false,
};

export const appStore = new ZustandStore({
  initialState,
  persistOptions: {
    name: "app-store",
    version: 1,
    persistedKeys: [],
    getStorage: () => localStorage,
  },
});
