import { SnapPoint } from "@f3/shared/app/constants";

import type { GeoMapSearchResult } from "./types";
import { placesDetails } from "./places-details";
import { setView } from "./set-view";
import { drawerStore } from "./store/drawer";
import { filterStore } from "./store/filter";
import { mapStore } from "./store/map";
import { searchStore } from "./store/search";
import { setSelectedItem } from "./store/selected-item";

export const onClickPlaceRowMap = (result: GeoMapSearchResult) => {
  searchStore.setState({ shouldShowResults: false });
  drawerStore.setState({ snap: SnapPoint["pt-150px"] });
  setSelectedItem({ locationId: null, eventId: null });
  void placesDetails(result.destination.placeId).then((place) => {
    const latitude = place.location.latitude;
    const longitude = place.location.longitude;
    mapStore.setState({
      placeResultArea: place.displayName.text,
      placeResultLocation: { lat: latitude, lng: longitude },
      nearbyLocationCenter: {
        lat: latitude,
        lng: longitude,
        name: result.header,
      },
    });
    setView({ lat: latitude, lng: longitude });
    setTimeout(() => {
      mapStore.get("ref").current?.invalidateSize();
    }, 0);
    filterStore.setState({ position: { latitude, longitude } });
  });
};
