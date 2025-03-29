import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";

import { mapStore } from "~/utils/store/map";

export const MapEventListener = () => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    // https://developers.google.com/maps/documentation/javascript/events
    const zoomChangedListener = map.addListener("zoom_changed", () => {
      mapStore.setState({ event: "zoom", hasMovedMap: true });
    });

    const dragEndListener = map.addListener("dragend", () => {
      mapStore.setState({ event: "idle", hasMovedMap: true });
    });

    const dragListener = map.addListener("dragstart", () => {
      mapStore.setState({ event: "drag", hasMovedMap: true });
    });

    const centerChangedListener = map.addListener("center_changed", () => {
      mapStore.setState({ event: "drag", hasMovedMap: true });
    });

    const idleListener = map.addListener("idle", () => {
      const center = map.getCenter();
      mapStore.setState({
        event: "idle",
        ...(center && { center: { lat: center.lat(), lng: center.lng() } }),
        zoom: map.getZoom(),
      });
    });

    return () => {
      zoomChangedListener.remove();
      idleListener.remove();
      dragEndListener.remove();
      dragListener.remove();
      centerChangedListener.remove();
    };
  }, [map]);

  return null;
};
