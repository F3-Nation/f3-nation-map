import { SnapPoint } from "@f3/shared/app/constants";
import { ZustandStore } from "@f3/shared/common/classes";

const initialState = {
  snap: SnapPoint["pt-150px"],
};

export const drawerStore = new ZustandStore({
  initialState,
  persistOptions: {
    name: "drawer-store",
    version: 1,
    persistedKeys: [],
    getStorage: () => localStorage,
  },
});
