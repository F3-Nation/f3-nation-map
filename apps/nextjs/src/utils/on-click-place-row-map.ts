import { SnapPoint } from "@f3/shared/app/constants";

import type { GeoMapSearchResult } from "./types";
import { placesDetails } from "./places-details";
import { drawerStore } from "./store/drawer";
import { mapStore } from "./store/map";
import { searchStore } from "./store/search";
import { selectedItemStore } from "./store/selected-item";

export const onClickPlaceRowMap = (result: GeoMapSearchResult) => {
  searchStore.setState({ shouldShowResults: false });
  drawerStore.setState({ snap: SnapPoint["pt-150px"] });
  selectedItemStore.setState({ locationId: null, eventId: null });
  void placesDetails(result.destination.placeId).then((place) => {
    const latitude = place.location.latitude;
    const longitude = place.location.longitude;
    mapStore.setState({
      placeResultLocation: { lat: latitude, lng: longitude },
    });
    mapStore.get("ref").current?.setView({ lat: latitude, lng: longitude }, 13);
  });
};
