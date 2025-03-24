import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Point,
} from "geojson";
import type Supercluster from "supercluster";
import type { ClusterProperties } from "supercluster";
import { useCallback, useMemo } from "react";
import { useMap } from "@vis.gl/react-google-maps";

import type { SparseF3Marker } from "~/utils/types";
import { useIsMobileWidth } from "~/utils/hooks/use-is-mobile-width";
import { useSupercluster } from "~/utils/hooks/use-supercluster";
import { isTouchDevice } from "~/utils/is-touch-device";
import { useFilteredMapResults } from "../map/filtered-map-results-provider";
import { FeatureMarker } from "../map/group-marker";
import { FeaturesClusterMarker } from "./features-cluster-marker";

interface ClusteredMarkersProps {
  geojson: FeatureCollection<Point, GeoJsonProperties>;
}

const superclusterOptions: Supercluster.Options<
  GeoJsonProperties,
  ClusterProperties
> = {
  extent: 256,
  radius: 80,
  maxZoom: 12,
};

export const ClusteredMarkers = () => {
  const { filteredLocationMarkers } = useFilteredMapResults();

  const geojson = useMemo(() => {
    if (!filteredLocationMarkers) return null;
    return getGeojson(filteredLocationMarkers);
  }, [filteredLocationMarkers]);
  return geojson && <DataProvidedClusteredMarkers geojson={geojson} />;
};

const DataProvidedClusteredMarkers = ({ geojson }: ClusteredMarkersProps) => {
  // console.log("ClusteredMarkers re-render");

  const isMobileWidth = useIsMobileWidth();
  const touchDevice = isTouchDevice();
  const isMobile = isMobileWidth || touchDevice;
  const map = useMap();
  const { clusters, getLeaves } = useSupercluster(geojson, superclusterOptions);

  const handleClusterClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, clusterId: number) => {
      const leaves = getLeaves(clusterId);
      const boundsOfLeaves = getBoundsOfLeaves(leaves);
      map?.fitBounds(boundsOfLeaves, isMobile ? 0 : 200);
    },
    [getLeaves, isMobile, map],
  );

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        if (typeof lng !== "number" || typeof lat !== "number") return null;
        const featureId = feature.id?.toString();
        if (!featureId) return null;

        const clusterProperties = feature.properties as ClusterProperties;
        const isCluster: boolean = clusterProperties.cluster;

        return isCluster ? (
          <FeaturesClusterMarker
            key={featureId}
            clusterId={clusterProperties.cluster_id}
            position={{ lat, lng }}
            size={clusterProperties.point_count}
            sizeAsText={String(clusterProperties.point_count_abbreviated)}
            onMarkerClick={handleClusterClick}
          />
        ) : (
          <FeatureMarker
            key={featureId}
            featureId={featureId}
            position={{ lat, lng }}
          />
        );
      })}
    </>
  );
};

const getBoundsOfLeaves = (leaves: Feature<Point>[]) => {
  const bounds = new google.maps.LatLngBounds();
  leaves.forEach((leaf) => {
    console.log("leaf", leaf.geometry.coordinates);
    const [lng, lat] = leaf.geometry.coordinates;
    if (typeof lng !== "number" || typeof lat !== "number") return;
    bounds.extend({ lat, lng });
  });
  return bounds;
};

const getGeojson = (filteredLocationMarkers: SparseF3Marker[]) => {
  const geojson = filteredLocationMarkers.reduce(
    (acc, marker) => {
      if (typeof marker.lon !== "number" || typeof marker.lat !== "number") {
        return acc;
      }
      acc.features.push({
        id: marker.id,
        type: "Feature",
        geometry: { type: "Point", coordinates: [marker.lon, marker.lat] },
        properties: {
          name: marker.aoName,
          address: marker.locationDescription,
        },
      });
      return acc;
    },
    { features: [], type: "FeatureCollection" } as FeatureCollection<
      Point,
      GeoJsonProperties
    >,
  ) ?? { features: [], type: "FeatureCollection" };
  return geojson;
};
