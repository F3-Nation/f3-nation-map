import type { Feature, FeatureCollection, Point } from "geojson";
import type Supercluster from "supercluster";
import type { ClusterProperties } from "supercluster";
import { useCallback, useMemo } from "react";
import { useWindowSize } from "@react-hook/window-size";
import { useMap } from "@vis.gl/react-google-maps";

import { BreakPoints } from "@acme/shared/app/constants";

import type { SparseF3Marker } from "~/utils/types";
import { useSupercluster } from "~/utils/hooks/use-supercluster";
import { mapStore } from "~/utils/store/map";
import { useFilteredMapResults } from "../map/filtered-map-results-provider";
import { FeatureMarker } from "../map/group-marker";
import { FeaturesClusterMarker } from "./features-cluster-marker";

interface F3ClusterProperties extends ClusterProperties {
  logos?: string;
}

interface MarkersProps {
  geojson: FeatureCollection<Point, MarkerProperties>;
}

interface MarkerProperties {
  name?: string | null;
  address?: string | null;
  logo?: string | null;
}

const superclusterOptions: Supercluster.Options<
  MarkerProperties,
  F3ClusterProperties
> = {
  extent: 256, // smaller means more in a cluster
  radius: 64, // Adjust this. smaller means more smaller clusters
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

const DataProvidedClusteredMarkers = ({ geojson }: MarkersProps) => {
  const modifiedLocationMarkers = mapStore.use.modifiedLocationMarkers();
  const [width] = useWindowSize();

  const map = useMap();
  const { clusters, getLeaves } = useSupercluster(geojson, superclusterOptions);
  const handleClusterClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, clusterId: number) => {
      // negative padding - https://github.com/visgl/react-google-maps/discussions/591
      const negativePadding = -1 * Math.max(0, (BreakPoints.LG - width) / 8); // about 80px at 480px
      const leaves = getLeaves(clusterId);
      const boundsOfLeaves = getBoundsOfLeaves(leaves);
      map?.fitBounds(boundsOfLeaves, negativePadding);
    },
    [getLeaves, map, width],
  );

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        if (typeof lng !== "number" || typeof lat !== "number") return null;
        const featureId = feature.id?.toString();
        if (!featureId) return null;

        const clusterProperties = feature.properties as F3ClusterProperties;
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
      {Object.entries(modifiedLocationMarkers).map(([id, marker]) => {
        return <FeatureMarker key={id} featureId={id} position={marker} />;
      })}
    </>
  );
};

const getBoundsOfLeaves = (leaves: Feature<Point>[]) => {
  const bounds = new google.maps.LatLngBounds();
  leaves.forEach((leaf) => {
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
          logo: marker.logo,
        },
      });
      return acc;
    },
    { features: [], type: "FeatureCollection" } as FeatureCollection<
      Point,
      MarkerProperties
    >,
  ) ?? { features: [], type: "FeatureCollection" };
  return geojson;
};
