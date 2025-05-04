import type { Cluster, Marker, Renderer } from "@googlemaps/markerclusterer";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MarkerClusterer,
  SuperClusterAlgorithm,
} from "@googlemaps/markerclusterer";
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
    if (!map) return null;

    return new MarkerClusterer({
      map,
      renderer: new CustomRenderer(),
      algorithm: new SuperClusterAlgorithm({
        extent: 256, // smaller means more in a cluster
        radius: 128, // Adjust this. smaller means more smaller clusters
        maxZoom: 12,
      }),
    });
  }, [map]);

  useEffect(() => {
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

  return filteredLocationMarkers?.map((marker) => {
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
};

class CustomRenderer implements Renderer {
  render({ count, position }: Cluster, stats: any) {
    // use d3-interpolateRgb to interpolate between red and blue
    const color = "black";
    // create svg url with fill color
    const svg = window.btoa(`
<svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
<circle cx="120" cy="120" opacity=".8" r="70" />    
</svg>`);
    // create marker using svg icon
    const markerSize = Math.floor(36 + Math.sqrt(count) * 2);
    const fontSize = Math.floor(Math.max(markerSize / 4, 12));
    return new google.maps.Marker({
      position,
      icon: {
        url: `data:image/svg+xml;base64,${svg}`,
        scaledSize: new google.maps.Size(markerSize * 2, markerSize * 2),
        anchor: new google.maps.Point(markerSize, markerSize),
      },
      label: {
        text: String(count),
        color: "rgba(255,255,255,0.9)",
        fontSize: `${fontSize}px`,
      },
      // adjust zIndex to be above other markers
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
    });
  }
}

class CustomRenderer2 implements Renderer {
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

    // Add a wrapper div to fix the centering issue
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.top = "50%";
    wrapper.style.left = "50%";
    wrapper.style.transform = "translate(-50%, -50%)";
    wrapper.appendChild(container);

    return new google.maps.marker.AdvancedMarkerElement({
      position,
      content: wrapper,
      zIndex: count,
    });
  }
}
