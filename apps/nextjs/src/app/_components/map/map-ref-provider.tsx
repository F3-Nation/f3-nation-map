import { mapStore } from "~/utils/store/map";

export const useMapRef = () => {
  const mapRef = mapStore.use.ref();
  return { mapRef };
};
