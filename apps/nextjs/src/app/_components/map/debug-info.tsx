import { mapStore } from "~/utils/store/map";
import { useFilteredMapResults } from "./filtered-map-results-provider";

export const DebugInfo = () => {
  const zoom = mapStore.use.zoom();
  const bounds = mapStore.use.bounds();
  const { filteredLocationMarkers } = useFilteredMapResults();

  return (
    <div className="absolute right-0 top-48 z-[1000] h-min bg-foreground/10 p-2 lg:bottom-0 lg:right-0">
      <div className="m-0 p-0">Zoom: {zoom.toFixed(1)}</div>
      <div className="m-0 p-0">North: {bounds?.getNorth().toFixed(5)}</div>
      <div className="m-0 p-0">East: {bounds?.getEast().toFixed(5)}</div>
      <div className="m-0 p-0">South: {bounds?.getSouth().toFixed(5)}</div>
      <div className="m-0 p-0">West: {bounds?.getWest().toFixed(5)}</div>
      <div className="m-0 p-0">Workouts: {filteredLocationMarkers?.length}</div>
    </div>
  );
};
