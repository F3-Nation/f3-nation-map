import { ZustandStore } from "@acme/shared/common/classes";

const initialState = {
  lat: null as number | null,
  lon: null as number | null,
  zoom: null as number | null,
  eventId: null as number | null,
  locationId: null as number | null,
};

export const queryParamStore = new ZustandStore({
  initialState,
  persistOptions: {
    name: "query-param-store",
    version: 1,
    persistedKeys: [],
    getStorage: () => localStorage,
  },
});
