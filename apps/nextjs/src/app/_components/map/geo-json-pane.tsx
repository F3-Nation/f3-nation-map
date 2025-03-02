import type { GeoJSONProps } from "react-leaflet";
import { GeoJSON } from "react-leaflet";

import { COUNTRY_ZOOM } from "@acme/shared/app/constants";
import { RERENDER_LOGS } from "@acme/shared/common/constants";

import { VISIBLE_COUNTRIES } from "~/assets/visible-countries";
import { mapStore } from "~/utils/store/map";

export const GeoJsonPane = () => {
  RERENDER_LOGS && console.log("GeoJsonPane rerender");
  const zoom = mapStore.use.zoom();
  const isFar = zoom < COUNTRY_ZOOM;
  return !isFar ? null : (
    <GeoJSON
      data={VISIBLE_COUNTRIES as unknown as GeoJSONProps["data"]}
      style={{
        fillColor: "#FF000070",
        fillOpacity: 1,
        color: "#FF000010",
      }}
    />
  );
};
