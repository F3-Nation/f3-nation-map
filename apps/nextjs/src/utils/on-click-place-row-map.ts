import { CLOSE_ZOOM, SnapPoint } from "@f3/shared/app/constants";

import type { GeoMapSearchResult } from "./types";
import { placesDetails } from "./places-details";
import { drawerStore } from "./store/drawer";
import { filterStore } from "./store/filter";
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
      placeResultArea: place.displayName.text,
      placeResultLocation: { lat: latitude, lng: longitude },
      expansionAreaSelected: { area: null, lat: null, lng: null },
    });
    mapStore
      .get("ref")
      .current?.setView(
        { lat: latitude, lng: longitude },
        Math.max(mapStore.get("zoom"), CLOSE_ZOOM),
        { animate: mapStore.get("zoom") === CLOSE_ZOOM },
      );
    setTimeout(() => {
      mapStore.get("ref").current?.invalidateSize();
    }, 0);
    filterStore.setState({ position: { latitude, longitude } });
  });
};
