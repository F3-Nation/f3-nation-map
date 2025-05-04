import type {
  Cluster,
  ClusterStats,
  Marker,
  Renderer,
} from "@googlemaps/markerclusterer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useMap } from "@vis.gl/react-google-maps";

import type { SparseF3Marker } from "~/utils/types";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";
import { useFilteredMapResults } from "../map/filtered-map-results-provider";
import { FeatureMarker } from "../map/group-marker";
import { useWindowSize } from "@react-hook/window-size";

// export const ClusteredMarkers = () => {
//   const { filteredLocationMarkers } = useFilteredMapResults();

//   const memoFilteredLocationMarkers = useMemo(() => {
//     if (!filteredLocationMarkers) return null;
//     return filteredLocationMarkers;
//   }, [filteredLocationMarkers]);

//   return (
//     <DataProvidedClusteredMarkers
//       filteredLocationMarkers={memoFilteredLocationMarkers}
//     />
//   );
// };

export const ClusteredMarkers = () => {
  // console.log("filteredLocationMarkers", filteredLocationMarkers);
  const { filteredLocationMarkers } = useFilteredMapResults();
  const selectedLocationId = selectedItemStore.use.locationId();
  const selectedEventId = selectedItemStore.use.eventId();
  const panelLocationId = selectedItemStore.use.panelLocationId();
  const panelEventId = selectedItemStore.use.panelEventId();

  const map = useMap();
  const [markers, setMarkers] = useState<Record<string, Marker>>({});
  const modifiedLocationMarkers = mapStore.use.modifiedLocationMarkers();
  const [width] = useWindowSize();

  const clusterer = useMemo(() => {
    console.log("clusterer");
    if (!map) return null;

    return new MarkerClusterer({ map, renderer: new CustomRenderer() });
  }, [map]);

  useEffect(() => {
    console.log("markers", Object.keys(markers).length);
    if (!clusterer) return;

    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(markers));
  }, [clusterer, markers]);

  const setMarkerRef = useCallback((marker: Marker | null, key: string) => {
    setMarkers((markers) => {
      if ((marker && markers[key]) ?? (!marker && !markers[key]))
        return markers;

      if (marker) {
        return { ...markers, [key]: marker };
      } else {
        const { [key]: _, ...newMarkers } = markers;

        return newMarkers;
      }
    });
  }, []);

  const memoFilteredLocationMarkers = useMemo(() => {
    if (!filteredLocationMarkers) return null;
    return filteredLocationMarkers.map((marker) => {
      console.log("rendering marker", marker.id);
      if (!marker.lat || !marker.lon) return null;
      const modifiedLocation = modifiedLocationMarkers[marker.id];
      const position = modifiedLocation ?? { lat: marker.lat, lng: marker.lon };
      const isCurrentSelectedLocation = selectedLocationId === marker.id;
      const isCurrentPanelLocation = panelLocationId === marker.id;
      const selectedEventIdOfEvents =
        marker.events.find((event) => event.id === selectedEventId)?.id ?? null;
      const panelEventIdOfEvents =
        marker.events.find((event) => event.id === panelEventId)?.id ?? null;
      return (
        <FeatureMarker
          key={marker.id}
          featureId={marker.id.toString()}
          position={{ lat: marker.lat, lng: marker.lon }}
          setMarkerRef={setMarkerRef}
          events={marker.events}
          selectedEventIdOfEvents={selectedEventIdOfEvents}
          panelEventIdOfEvents={panelEventIdOfEvents}
          isCurrentSelectedLocation={isCurrentSelectedLocation}
          isCurrentPanelLocation={isCurrentPanelLocation}
        />
      );
    });
  }, [filteredLocationMarkers, setMarkerRef, selectedLocationId, selectedEventId, panelLocationId, panelEventId]);

  return memoFilteredLocationMarkers;
};

class CustomRenderer implements Renderer {
  /**
   * The default render function for the library used by {@link MarkerClusterer}.
   *
   * Currently set to use the following:
   *
   * ```typescript
   * // change color if this cluster has more markers than the mean cluster
   * const color =
   *   count > Math.max(10, stats.clusters.markers.mean)
   *     ? "#ff0000"
   *     : "#0000ff";
   *
   * // create svg url with fill color
   * const svg = window.btoa(`
   * <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
   *   <circle cx="120" cy="120" opacity=".6" r="70" />
   *   <circle cx="120" cy="120" opacity=".3" r="90" />
   *   <circle cx="120" cy="120" opacity=".2" r="110" />
   *   <circle cx="120" cy="120" opacity=".1" r="130" />
   * </svg>`);
   *
   * // create marker using svg icon
   * return new google.maps.Marker({
   *   position,
   *   icon: {
   *     url: `data:image/svg+xml;base64,${svg}`,
   *     scaledSize: new google.maps.Size(45, 45),
   *   },
   *   label: {
   *     text: String(count),
   *     color: "rgba(255,255,255,0.9)",
   *     fontSize: "12px",
   *   },
   *   // adjust zIndex to be above other markers
   *   zIndex: 1000 + count,
   * });
   * ```
   */
  render({ count, position }: Cluster, stats: ClusterStats): Marker {
    return new google.maps.marker.AdvancedMarkerElement({
      position,
      content: document.createElement("div"),
      zIndex: 1000 + count,
    });
  }
}
