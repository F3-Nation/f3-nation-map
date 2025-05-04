import type { Marker } from "@googlemaps/markerclusterer";
import { useCallback } from "react";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
} from "@vis.gl/react-google-maps";

import { Z_INDEX } from "@acme/shared/app/constants";
import { dayOfWeekToShortDayOfWeek } from "@acme/shared/app/functions";
import { cn } from "@acme/ui";

import type { SparseF3Marker } from "~/utils/types";
import { groupMarkerClick } from "~/utils/actions/group-marker-click";
import { appStore } from "~/utils/store/app";
import { mapStore } from "~/utils/store/map";
import {
  selectedItemStore,
  setSelectedItem,
} from "~/utils/store/selected-item";
import { useTouchDevice } from "~/utils/touch-device-provider";

interface TreeMarkerProps {
  position: google.maps.LatLngLiteral;
  featureId: string;
  setMarkerRef?: (marker: Marker | null, key: string) => void;
  onMarkerClick?: (
    marker: google.maps.marker.AdvancedMarkerElement,
    featureId: string,
  ) => void;
  events: SparseF3Marker["events"];
  isCurrentSelectedLocation?: boolean;
  isCurrentPanelLocation?: boolean;
  // Only if the eventId is one of the events in the marker
  selectedEventIdOfEvents?: number | null;
  // Only if the eventId is one of the events in the marker
  panelEventIdOfEvents?: number | null;
}

export const FeatureMarker = ({
  position,
  featureId,
  setMarkerRef,
  events,
  isCurrentSelectedLocation,
  isCurrentPanelLocation,
  selectedEventIdOfEvents,
  panelEventIdOfEvents,
}: TreeMarkerProps) => {
  const ref = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement) =>
      setMarkerRef?.(marker, featureId),
    [setMarkerRef, featureId],
  );
  const mode = appStore.use.mode();
  const { isTouchDevice: touchDevice } = useTouchDevice();
  const id = Number(featureId);

  const noSelectedEvent = selectedEventIdOfEvents == null;
  const noSelectedPanelEvent = panelEventIdOfEvents == null;

  const handleClick = useCallback(
    ({ locationId, eventId }: { locationId: number; eventId?: number }) => {
      void groupMarkerClick({
        locationId,
        ...(eventId == null ? {} : { eventId }),
      });
    },
    [],
  );

  const handleHover = useCallback(
    ({ locationId, eventId }: { locationId: number; eventId?: number }) => {
      setSelectedItem({ locationId, eventId, showPanel: false });
    },
    [],
  );

  const handleDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      e.stop();
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();

      if (!lat || !lng) return;

      mapStore.setState({
        modifiedLocationMarkers: {
          ...mapStore.get("modifiedLocationMarkers"),
          [id]: { lat, lng },
        },
      });
    },
    [id],
  );

  return !events?.length ? null : (
    <AdvancedMarker
      ref={ref}
      draggable={mode === "edit"}
      position={position}
      anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
      className={"marker feature"}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        // There are some places on the icon where the button is not clicked
        // but the marker is clicked (bottom left and right corners)
        // This is also necessary for mobile edit mode clicks
        const eventId = events.find(
          (event) => event.id === selectedItemStore.get("eventId"),
        )?.id;
        handleClick({
          locationId: id,
          eventId: eventId ?? events[0]?.id,
        });

        // Must call stop to prevent the map from being clicked
        e.stop();
      }}
      zIndex={
        isCurrentSelectedLocation
          ? Z_INDEX.SELECTED_MARKER
          : isCurrentPanelLocation
            ? Z_INDEX.PANEL_ITEM_MARKER
            : Z_INDEX.NON_HOVERED_MAP_MARKER
      }
    >
      <div className="relative flex flex-col">
        <div
          className={cn("flex flex-row rounded-full ring-[1px] ring-gray-700")}
          style={{ zIndex: 1, width: `${events.length * 30 + 4}px` }}
        >
          {events.map((event, eventIdx, eventArray) => {
            // const isCurrentPanelLocation = panelLocationId === id;
            const isCurrentPanelEvent = panelEventIdOfEvents === event.id;
            const isCurrentSelectedEvent = selectedEventIdOfEvents === event.id;
            const dotw = event.dayOfWeek;
            const isStart = eventIdx === 0;
            const isEnd = eventIdx === eventArray.length - 1;
            const dayText = dotw ? dayOfWeekToShortDayOfWeek(dotw) : null;
            return (
              <button
                key={id + "-" + event.id}
                onClick={(e) => {
                  handleClick({ locationId: id, eventId: event.id });
                  e.stopPropagation();
                }}
                onMouseEnter={(e) => {
                  handleHover({ locationId: id, eventId: event.id });
                  e.stopPropagation();
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
                      isCurrentPanelEvent ||
                      (isCurrentPanelLocation && noSelectedPanelEvent),
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
