import { ZustandStore } from "@f3/shared/common/classes";

export const selectedItemStore = new ZustandStore({
  initialState: {
    locationId: null as number | null,
    eventId: null as number | null,
  },
  persistOptions: {
    name: "selected-item-store",
    persistedKeys: [],
    version: 1,
    getStorage: () => localStorage,
  },
});
