import { useEffect } from "react";
import { Z_INDEX } from "node_modules/@f3/shared/src/app/constants";
import { Pane } from "react-leaflet/Pane";

import { mapStore } from "~/utils/store/map";
import PlaceExpansionNearbyMarker from "./place-expansion-nearby-marker";

export const PlaceExpansionNearbyUsersPane = () => {
  const mapRef = mapStore.use.ref();
  const { nearbyUsers: placeExpansionNearbyUsers } =
    mapStore.use.expansionNearbyUsers();
  const expansionPopupOpen = mapStore.use.expansionPopupOpen();
  const pane = mapRef.current?.getPane("place-expansion-nearby-users-pane");

  useEffect(() => {
    if (pane) {
      pane.style.zIndex = expansionPopupOpen
        ? Z_INDEX.PLACE_EXPANSION_NEARBY_USERS.toString()
        : Z_INDEX.PLACE_RESULTS_ICON_PANE.toString();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expansionPopupOpen]);

  return (
    <Pane
      name="place-expansion-nearby-users-pane"
      style={{
        zIndex: Z_INDEX.PLACE_EXPANSION_NEARBY_USERS,
      }}
    >
      {placeExpansionNearbyUsers &&
        placeExpansionNearbyUsers?.length > 0 &&
        placeExpansionNearbyUsers.map((nearbyUsers) => {
          return (
            <PlaceExpansionNearbyMarker
              key={`nearby-user-${nearbyUsers.id}`}
              nearbyUsers={nearbyUsers}
            />
          );
        })}
    </Pane>
  );
};
