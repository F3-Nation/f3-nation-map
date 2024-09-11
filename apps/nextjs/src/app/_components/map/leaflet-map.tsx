"use client";

import "~/utils/leaflet-canvas-markers"; // with modifications
import "~/utils/smooth-zoom-wheel"; // with modifications

import "leaflet/dist/leaflet.css";

import type { TileLayerProps } from "react-leaflet";
import { useWindowSize } from "@react-hook/window-size";
import { MapContainer, TileLayer } from "react-leaflet";

import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  HEADER_HEIGHT,
  SIDEBAR_WIDTH,
} from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { useTheme } from "@f3/ui/theme";

import type { RouterOutputs } from "~/trpc/types";
import { mapStore } from "~/utils/store/map";
import { CanvasIconLayer } from "./canvas-layer";
import { GeoJsonPane } from "./geo-json-pane";
import { MapListener } from "./map-listener";
import { SelectedIconMarkerPane } from "./selected-item-marker-pane";
import { UserLocationMarker } from "./user-location-marker";
import { useUserLocation } from "./user-location-provider";
import { ZoomedMarkerPane } from "./zoomed-marker-pane";

// const DEFAULT_CENTER = { lat: 36.13910556091472, lng: -81.6757511960024 };

export const LeafletMap = ({
  markerLocations,
}: {
  markerLocations: RouterOutputs["location"]["getLocationMarkersSparse"];
}) => {
  const { userLocation } = useUserLocation();
  RERENDER_LOGS && console.log("LeafletMap rerender");
  const ref = mapStore.use.ref();
  const [width, height] = useWindowSize();
  return (
    <div
      style={
        width >= 1024
          ? { height: height - HEADER_HEIGHT, width: width - SIDEBAR_WIDTH }
          : { height, width: "100%" }
      }
    >
      <MapContainer
        ref={ref}
        center={
          userLocation
            ? { lat: userLocation.latitude, lng: userLocation.longitude }
            : DEFAULT_CENTER
        }
        // https://stackoverflow.com/questions/13851888/how-can-i-change-the-default-loading-tile-color-in-leafletjs
        // tile loading background color is here:
        // apps/nextjs/src/app/globals.css
        preferCanvas={true}
        zoom={DEFAULT_ZOOM}
        zoomSnap={0.1}
        scrollWheelZoom={false} // disable original zoom function
        smoothWheelZoom={true} // enable smooth zoom
        smoothSensitivity={6} // zoom speed. default is 1
        doubleClickZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
        zoomControl={false}
      >
        <MapContent markerLocations={markerLocations} />
      </MapContainer>
    </div>
  );
};

const MapContent = ({
  markerLocations,
}: {
  markerLocations: RouterOutputs["location"]["getLocationMarkersSparse"];
}) => {
  const tile = mapStore.use.tiles();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  RERENDER_LOGS && console.log("MapContent rerender");
  const terrainProps: TileLayerProps = {
    url: "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  };

  // https://github.com/CartoDB/basemap-styles
  const lightStreetProps: TileLayerProps = {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
  };

  // https://github.com/CartoDB/basemap-styles
  const darkStreetProps: TileLayerProps = {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
  };

  const tileProps: TileLayerProps & { key: string } = {
    key: `${tile}-${isDark ? "dark" : "light"}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    noWrap: true,
    ...(tile === "satellite"
      ? terrainProps
      : isDark
        ? darkStreetProps
        : lightStreetProps),
  };

  return (
    <>
      <MapListener />
      <TileLayer {...tileProps} />
      <SelectedIconMarkerPane />
      <ZoomedMarkerPane />
      <GeoJsonPane />
      <CanvasIconLayer markerLocations={markerLocations} />
      <UserLocationMarker />
    </>
  );
};

export default LeafletMap;
