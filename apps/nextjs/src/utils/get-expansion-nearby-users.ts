import type { LatLng } from "leaflet";

import type { ExpansionUserResponse } from "@f3/shared/app/schema/ExpansionUserSchema";
import isWithinRadius from "@f3/shared/app/functions";

import { mapStore } from "./store/map";

export type ExpansionUser = LatLng & { id: string; area: string };

export const getExpansionNearbyUsers = ({
  zoom = 11,
  expansionUsers,
  popupOpen = true,
}: {
  zoom?: number;
  expansionUsers: ExpansionUserResponse[];
  popupOpen?: boolean;
}) => {
  const resultLocationCenter = mapStore.get("placeResultLocation");
  const expansionCurrentCenter = mapStore.get("expansionNearbyUsers").center;

  if (
    resultLocationCenter &&
    resultLocationCenter?.lat !== expansionCurrentCenter?.lat &&
    resultLocationCenter?.lng !== expansionCurrentCenter?.lng
  ) {
    const { lat, lng } = resultLocationCenter;

    const nearbyUsers = expansionUsers
      .filter((user) => {
        return isWithinRadius({
          miles: 20,
          checkPosition: { lat: user.pinnedLat, long: user.pinnedLng },
          basePosition: { lat: lat, long: lng },
        });
      })
      .map((user) => {
        return {
          id: user.id,
          lat: user.pinnedLat,
          lng: user.pinnedLng,
          area: user.area,
        } as ExpansionUser;
      });

    mapStore.setState({
      expansionNearbyUsers: {
        center: resultLocationCenter,
        nearbyUsers,
      },
      expansionPopupOpen: popupOpen,
    });
    mapStore
      .get("ref")
      .current?.setView({ lat: lat, lng: lng }, zoom, { animate: true });

    setTimeout(() => {
      mapStore.get("ref").current?.invalidateSize();
    }, 0);
  }
};
