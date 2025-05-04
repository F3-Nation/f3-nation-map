import type { Cluster, Marker, Renderer } from "@googlemaps/markerclusterer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useMap } from "@vis.gl/react-google-maps";

import { mapStore } from "~/utils/store/map";
import { useFilteredMapResults } from "../map/filtered-map-results-provider";
import { FeatureMarker } from "../map/group-marker";

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

  const map = useMap();
  const [markers, setMarkers] = useState<Record<string, Marker>>({});
  const modifiedLocationMarkers = mapStore.use.modifiedLocationMarkers();

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
      const modifiedLocation = modifiedLocationMarkers[marker.id];
      const markerPosition =
        marker.lat != null && marker.lon != null
          ? { lat: marker.lat, lng: marker.lon }
          : null;
      const position = modifiedLocation ?? markerPosition;
      if (!position) return null;
      return (
        <FeatureMarker
          key={marker.id}
          featureId={marker.id.toString()}
          position={position}
          setMarkerRef={setMarkerRef}
          events={marker.events}
        />
      );
    });
  }, [filteredLocationMarkers, modifiedLocationMarkers, setMarkerRef]);

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
  render({ count, position }: Cluster): Marker {
    const container = document.createElement("div");
    const markerSize = Math.floor(36 + Math.sqrt(count) * 2);

    // Set up container styles
    container.style.width = `${markerSize}px`;
    container.style.height = `${markerSize}px`;
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.borderRadius = "9999px";
    container.style.backgroundColor = "rgba(0, 0, 0, 0.3)";

    // Create middle circle
    const middleCircle = document.createElement("div");
    middleCircle.style.position = "relative";
    middleCircle.style.display = "flex";
    middleCircle.style.width = "80%";
    middleCircle.style.height = "80%";
    middleCircle.style.alignItems = "center";
    middleCircle.style.justifyContent = "center";
    middleCircle.style.borderRadius = "9999px";
    middleCircle.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

    // Create inner circle with count
    const innerCircle = document.createElement("div");
    innerCircle.style.position = "absolute";
    innerCircle.style.display = "flex";
    innerCircle.style.width = "75%";
    innerCircle.style.height = "75%";
    innerCircle.style.alignItems = "center";
    innerCircle.style.justifyContent = "center";
    innerCircle.style.borderRadius = "9999px";
    innerCircle.style.backgroundColor = "#000000";
    innerCircle.style.color = "#ffffff";
    innerCircle.style.fontSize = `${Math.max(markerSize / 4, 12)}px`;
    innerCircle.style.textAlign = "center";
    innerCircle.textContent = String(count);

    middleCircle.appendChild(innerCircle);
    container.appendChild(middleCircle);

    const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: container,
      zIndex: count,
    });

    console.log("renderClusterMarker", { count, markerSize });

    return advancedMarker;
  }
}
