import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

import { dayOfWeekToShortDayOfWeek } from "@acme/shared/app/functions";
import { cn } from "@acme/ui";

import { groupMarkerClick } from "~/utils/actions/group-marker-click";
import { isTouchDevice } from "~/utils/is-touch-device";
import {
  selectedItemStore,
  setSelectedItem,
} from "~/utils/store/selected-item";
import { useFilteredMapResults } from "../map/filtered-map-results-provider";

interface TreeMarkerProps {
  position: google.maps.LatLngLiteral;
  featureId: string;
  onMarkerClick?: (
    marker: google.maps.marker.AdvancedMarkerElement,
    featureId: string,
  ) => void;
}

export const FeatureMarker = ({ position, featureId }: TreeMarkerProps) => {
  const { filteredLocationMarkers } = useFilteredMapResults();
  const selectedLocationId = selectedItemStore.use.locationId();
  const selectedEventId = selectedItemStore.use.eventId();
  const panelEventId = selectedItemStore.use.panelEventId();
  const touchDevice = isTouchDevice();
  const [markerRef] = useAdvancedMarkerRef();
  const id = Number(featureId);

  const events = filteredLocationMarkers?.find(
    (marker) => marker.id === id,
  )?.events;
  const isCurrentSelectedLocation = selectedLocationId === id;
  const noSelectedEvent = selectedEventId == null;

  return !events?.length ? null : (
    <AdvancedMarker
      ref={markerRef}
      position={position}
      anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
      className={"marker feature"}
    >
      <div className="relative flex flex-col">
        <div
          className={cn("flex flex-row rounded-full ring-[1px] ring-gray-700")}
          style={{ zIndex: 1, width: `${events.length * 30 + 4}px` }}
        >
          {events.map((event, eventIdx, eventArray) => {
            const isCurrentPanelEvent = panelEventId === event.id;
            const isCurrentSelectedEvent = selectedEventId === event.id;
            const dotw = event.dayOfWeek;
            const isStart = eventIdx === 0;
            const isEnd = eventIdx === eventArray.length - 1;
            const dayText = dotw ? dayOfWeekToShortDayOfWeek(dotw) : null;
            return (
              <button
                key={id + "-" + event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void groupMarkerClick({
                    locationId: id,
                    ...(isNaN(event.id) ? {} : { eventId: event.id }),
                  });
                }}
                onMouseEnter={() => {
                  if (touchDevice) return;
                  const eventId = event.id;
                  const isAlreadySelected = isCurrentSelectedEvent;
                  setSelectedItem({
                    locationId: id,
                    ...(isNaN(eventId) ? {} : { eventId }),
                    showPanel: !!isAlreadySelected,
                  });
                }}
                className={cn(
                  "flex-1 cursor-pointer border-b-2 border-t-2 border-foreground bg-foreground py-2 text-center text-background",
                  "border-l-2 border-r-2",
                  `google-eventid-${event.id}`,
                  {
                    "rounded-r-full": isEnd,
                    "rounded-l-full": isStart,
                    "border-red-600 dark:border-red-400":
                      isCurrentSelectedEvent ||
                      (isCurrentSelectedLocation && noSelectedEvent),
                    "border-red-600 bg-red-600 font-bold dark:bg-red-400":
                      // On mobile we always use the background
                      (touchDevice && isCurrentSelectedEvent) ||
                      isCurrentPanelEvent,
                  },
                )}
              >
                {dayText}
              </button>
            );
          })}
        </div>
        <svg
          viewBox="0 0 40 40"
          className="-mt-[10.5px] w-[28px] self-center"
          style={{ zIndex: 0 }}
        >
          <path
            className={cn("fill-foreground", {
              "fill-[#dc2626] dark:fill-[#f87171]": false,
            })}
            d={
              events.length === 1
                ? "M34 10 L26 24.249 Q20 34.641 14 24.249 L6 10"
                : "M34 14.5 L26 24.249 Q20 34.641 14 24.249 L6 14.5"
            }
            stroke="none"
          />
          <path
            d={
              events.length === 1
                ? "M34 10 L26 24.249 Q20 34.641 14 24.249 L6 10"
                : "M34 15 L26 24.249 Q20 34.641 14 24.249 L6 15"
            }
            stroke="background"
            strokeWidth={0.5}
            fill="none"
          />
        </svg>
      </div>
    </AdvancedMarker>
  );
};
