"use client";

import "~/utils/leaflet-canvas-markers"; // with modifications
import "~/utils/smooth-zoom-wheel"; // with modifications

import "leaflet/dist/leaflet.css";

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
import { CenterPointMarker } from "./center-point-marker";
import { DebugInfo } from "./debug-info";
import { GeoJsonPane } from "./geo-json-pane";
import { MapListener } from "./map-listener";
import { PlaceResultIconPane } from "./place-result-icon-pane";
import { SelectedIconMarkerLayer } from "./selected-item-marker";
import { UserLocationIconAndMarker } from "./user-location-icon-and-marker";
import { useUserLocation } from "./user-location-provider";
import { ZoomButtons } from "./zoom-buttons";
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  RERENDER_LOGS && console.log("MapContent rerender");
  const tileUrl = isDark
    ? // https://github.com/CartoDB/basemap-styles
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <>
      <MapListener />
      <TileLayer
        key={isDark ? "dark" : "light"}
        // More tile options: https://leaflet-extras.github.io/leaflet-providers/preview/
        // url='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'

        // Dark
        // url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        // attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

        // Smooth
        // url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        // attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

        // Outdoors
        // url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
        // attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

        // Actually free?
        url={tileUrl}
        attribution={attribution}
        subdomains="abcd"
        noWrap
      />
      <ZoomedMarkerPane />
      <GeoJsonPane />
      <CanvasIconLayer markerLocations={markerLocations} />
      <SelectedIconMarkerLayer />
      <UserLocationIconAndMarker />
      <PlaceResultIconPane />
      <ZoomButtons />
      <CenterPointMarker />

      {process.env.NODE_ENV === "development" ? <DebugInfo /> : null}
    </>
  );
};

export default LeafletMap;
