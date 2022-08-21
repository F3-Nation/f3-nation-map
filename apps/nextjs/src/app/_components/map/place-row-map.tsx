import { MapPin } from "lucide-react";

import { SnapPoint } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { CardDescription, CardHeader, CardTitle } from "@f3/ui/card";

import type { GeoMapSearchResult } from "~/utils/types";
import { placesDetails } from "~/utils/places-details";
import { drawerStore } from "~/utils/store/drawer";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import { selectedItemStore } from "~/utils/store/selected-item";

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

export const PlaceRowMap = ({
  result,
  focused,
}: {
  result: GeoMapSearchResult;
  focused?: boolean;
}) => {
  return (
    <button
      className="w-full"
      onClick={() => {
        onClickPlaceRowMap(result);
      }}
    >
      <CardHeader
        className={cn("flex-row items-center gap-2 p-2 hover:bg-foreground/5", {
          "bg-foreground/5": focused,
        })}
      >
        <MapPin />
        <div className="flex-4 text-left">
          <CardTitle>{result.header}</CardTitle>
          <CardDescription className="line-clamp-1">
            {result.description}
          </CardDescription>
        </div>
      </CardHeader>
    </button>
  );
};
