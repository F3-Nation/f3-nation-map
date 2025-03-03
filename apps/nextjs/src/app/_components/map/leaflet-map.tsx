"use client";

import "~/utils/leaflet-canvas-markers"; // with modifications
import "~/utils/smooth-zoom-wheel"; // with modifications

import type { TileLayerProps } from "react-leaflet";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWindowSize } from "@react-hook/window-size";
import { MapContainer, TileLayer } from "react-leaflet";

import { DEFAULT_CENTER, SIDEBAR_WIDTH } from "@acme/shared/app/constants";
import { RERENDER_LOGS } from "@acme/shared/common/constants";
import { useTheme } from "@acme/ui/theme";
import { toast } from "@acme/ui/toast";

import type { F3MarkerLocation } from "~/utils/types";
import { queryClientUtils } from "~/trpc/react";
import { appStore } from "~/utils/store/app";
import { mapStore } from "~/utils/store/map";
import { CanvasIconLayer } from "./canvas-layer";
import { GeoJsonPane } from "./geo-json-pane";
import { MapListener } from "./map-listener";
import { useMapRef } from "./map-ref-provider";
import { PlaceResultIconPane } from "./place-result-icon-pane";
import { SelectedIconMarkerPane } from "./selected-item-marker-pane";
import { UpdatePane } from "./update-pane";
import { UserLocationMarker } from "./user-location-marker";
import { useUserLocation } from "./user-location-provider";
import { ZoomedMarkerPane } from "./zoomed-marker-pane";

// const DEFAULT_CENTER = { lat: 36.13910556091472, lng: -81.6757511960024 };

export const LeafletMap = ({
  sparseLocations,
}: {
  sparseLocations: F3MarkerLocation[];
}) => {
  const center = mapStore.use.center();
  const zoom = mapStore.use.zoom();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsRef = useRef(searchParams?.get("error"));
  const { userLocation } = useUserLocation();
  RERENDER_LOGS && console.log("LeafletMap rerender");
  const [width, height] = useWindowSize();
  const { mapRef } = useMapRef();
  const hasSetUtils = useRef(false);

  if (!hasSetUtils.current) {
    hasSetUtils.current = true;
    queryClientUtils.location.getLocationMarkersSparse.setData(
      undefined,
      sparseLocations,
    );
  }

  useEffect(() => {
    const error = searchParamsRef.current;
    if (error === "invalid-submission") {
      toast.error("Invalid submission");
      searchParamsRef.current = null;
      if (pathname) {
        router.replace(pathname, { scroll: false });
      }
    }
  }, [pathname, router]);

  return (
    <div
      style={{
        height,
        width: width >= 1024 ? width - SIDEBAR_WIDTH : width,
      }}
    >
      <MapContainer
        ref={(map) => {
          mapRef.current = map;
          mapStore.setState({ loaded: true });
        }}
        center={
          userLocation
            ? { lat: userLocation.latitude, lng: userLocation.longitude }
            : center
              ? center
              : DEFAULT_CENTER
        }
        // https://stackoverflow.com/questions/13851888/how-can-i-change-the-default-loading-tile-color-in-leafletjs
        // tile loading background color is here:
        preferCanvas={true}
        zoom={zoom}
        zoomSnap={0.1}
        scrollWheelZoom={false} // disable original zoom function
        smoothWheelZoom={true} // enable smooth zoom
        smoothSensitivity={6} // zoom speed. default is 1
        doubleClickZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
        zoomControl={false}
      >
        <MapContent markerLocations={sparseLocations} />
      </MapContainer>
    </div>
  );
};

const MapContent = ({
  markerLocations,
}: {
  markerLocations: F3MarkerLocation[];
}) => {
  const tile = mapStore.use.tiles();
  const mode = appStore.use.mode();
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

  const tileProps: TileLayerProps = {
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
      <TileLayer key={`${tile}-${isDark ? "dark" : "light"}`} {...tileProps} />
      <ZoomedMarkerPane />
      <SelectedIconMarkerPane />
      <GeoJsonPane />
      <CanvasIconLayer markerLocations={markerLocations} />
      <UserLocationMarker />
      <PlaceResultIconPane />
      {mode === "edit" && <UpdatePane />}
    </>
  );
};

export default LeafletMap;
