"use client";

import { memo, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWindowSize } from "@react-hook/window-size";
import { APIProvider, ControlPosition, Map } from "@vis.gl/react-google-maps";

import {
  BreakPoints,
  DEFAULT_CENTER,
  SIDEBAR_WIDTH,
} from "@acme/shared/app/constants";
import { safeParseFloat, safeParseInt } from "@acme/shared/common/functions";
import { useTheme } from "@acme/ui/theme";
import { toast } from "@acme/ui/toast";

import type { RouterOutputs } from "~/trpc/types";
import { env } from "~/env";
import { api } from "~/trpc/react";
import { useIsMobileWidth } from "~/utils/hooks/use-is-mobile-width";
import { useUpdateLocSearchParams } from "~/utils/hooks/use-update-loc-search-params";
import { appStore } from "~/utils/store/app";
import { mapStore } from "~/utils/store/map";
import { closePanel, setSelectedItem } from "~/utils/store/selected-item";
import { MapEventListener } from "../map-event-listener";
import { MapLayoutItems } from "../map-layout-items";
import { ClusteredMarkers } from "../marker-clusters/clustered-markers";
import { PlaceResultIconPane } from "./place-result-icon-pane";
import { UpdatePane } from "./update-pane";

interface MapConfig {
  id: string;
  label: string;
  mapId?: string;
  mapTypeId?: string;
  styles?: google.maps.MapTypeStyle[];
}

const MapTypeId = {
  HYBRID: "hybrid",
  ROADMAP: "roadmap",
  SATELLITE: "satellite",
  TERRAIN: "terrain",
};

const MAP_CONFIGS: MapConfig[] = [
  {
    id: "light",
    label: "Light",
    mapId: "c125c852122e9fed",
    mapTypeId: MapTypeId.ROADMAP,
  },
  {
    id: "dark",
    label: "Dark",
    mapId: "d8b7f3c31882c7b2",
    mapTypeId: MapTypeId.ROADMAP,
  },
  {
    id: "hybrid",
    label: "Hybrid (no mapId)",
    mapId: "92006e222591cd7f",
    mapTypeId: MapTypeId.HYBRID,
  },
];

export const GoogleMapComponent = () => {
  const utils = api.useUtils();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirectedForQueryParams = useRef(false);

  const searchParams = useSearchParams();
  const queryLat = safeParseFloat(searchParams?.get("lat"));
  const queryLon = safeParseFloat(
    searchParams?.get("lon") ?? searchParams?.get("lng"),
  );
  const queryZoom = safeParseFloat(searchParams?.get("zoom"));
  const queryLocationId = safeParseInt(searchParams?.get("locationId"));
  const queryEventId = safeParseInt(searchParams?.get("eventId"));
  const searchParamsRef = useRef(searchParams?.get("error"));

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

  // This needs to just be an onload thing TODO
  useEffect(() => {
    if (
      queryLocationId != null &&
      queryEventId != null &&
      !hasRedirectedForQueryParams.current
    ) {
      hasRedirectedForQueryParams.current = true;
      setSelectedItem({
        locationId: Number(queryLocationId),
        eventId: Number(queryEventId),
        showPanel: true,
      });
    }
  }, [queryLocationId, queryEventId]);

  return (
    <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_API_KEY}>
      <ProvidedGoogleMapComponent
        defaultZoom={getDefaultZoom({ queryZoom: queryZoom })}
        defaultCenter={getDefaultCenter({
          locationData: utils.location.getMapEventAndLocationData.getData(),
          queryLat,
          queryLon,
          queryLocationId,
        })}
      />
    </APIProvider>
  );
};

const ProvidedGoogleMapComponent = memo(
  ({
    defaultZoom,
    defaultCenter,
  }: {
    defaultZoom: number;
    defaultCenter: google.maps.LatLngLiteral;
  }) => {
    console.log("ProvidedGoogleMapComponent rerender");

    const { isMobileWidth } = useIsMobileWidth();
    const { resolvedTheme } = useTheme();

    const tiles = mapStore.use.tiles();
    const mapTiles = MAP_CONFIGS.find((map) =>
      tiles !== "street"
        ? map.id === tiles
        : resolvedTheme === "dark"
          ? map.id === "dark"
          : map.id === "light",
    );

    const [width, height] = useWindowSize();

    // We have to manage mounting the map otherwise there is a mismatch in rendered size
    // Causing it to render as a blank screen. Not sure why "use client" isn't working
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
      setIsMounted(true);
    }, []);
    if (!isMounted) {
      return <div style={{ height: "100vh", width: "100%" }} />;
    }

    return (
      <div
        style={{
          height: height,
          width:
            width >= Number(BreakPoints.LG) ? width - SIDEBAR_WIDTH : width,
        }}
      >
        <Map
          mapId={mapTiles?.mapId}
          mapTypeId={mapTiles?.mapTypeId}
          styles={mapTiles?.styles}
          defaultZoom={defaultZoom}
          defaultCenter={defaultCenter}
          gestureHandling="greedy"
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
          zoomControl={true}
          zoomControlOptions={{
            position: isMobileWidth
              ? ControlPosition.RIGHT_TOP
              : ControlPosition.RIGHT_BOTTOM,
          }}
          cameraControl={false}
          disableDoubleClickZoom
          // styles={[ { featureType: "all", elementType: "all", stylers: [{ visibility: "off" }], }, ]}
          onClick={(e) => {
            console.log("map on click", e);
            if (appStore.get("mode") === "edit" && e.detail.latLng) {
              const latLng = e.detail.latLng;
              mapStore.setState({ updateLocation: latLng });
            } else {
              setSelectedItem({
                locationId: null,
                eventId: null,
                showPanel: false,
              });
              closePanel();
            }
          }}
          clickableIcons={false}
        >
          <UrlUpdater />
          <ClusteredMarkers />
          <MapLayoutItems />
          <UpdatePane />
          <PlaceResultIconPane />
          <MapEventListener />
        </Map>
      </div>
    );
  },
  () => {
    return false;
  },
);

ProvidedGoogleMapComponent.displayName = "ProvidedGoogleMapComponent";

const getDefaultCenter = ({
  queryLat,
  queryLon,
  queryLocationId,
  locationData,
}: {
  queryLat: number | undefined;
  queryLon: number | undefined;
  queryLocationId: number | undefined;
  locationData:
    | RouterOutputs["location"]["getMapEventAndLocationData"]
    | undefined
    | null;
}) => {
  const locationLatLng = locationData?.find(
    (location) => location[0] === queryLocationId,
  );
  const lat = locationLatLng?.[3];
  const lon = locationLatLng?.[4];
  const center = mapStore.get("center");

  return lat != null && lon != null
    ? { lat, lng: lon }
    : queryLat != null && queryLon != null
      ? { lat: queryLat, lng: queryLon }
      : center
        ? center
        : { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };
};

const UrlUpdater = () => {
  useUpdateLocSearchParams();
  return null;
};

const getDefaultZoom = ({ queryZoom }: { queryZoom: number | undefined }) => {
  const zoom = mapStore.get("zoom");
  return queryZoom ?? zoom;
};
