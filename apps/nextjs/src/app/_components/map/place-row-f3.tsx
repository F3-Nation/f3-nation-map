import { SnapPoint } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { CardHeader, CardTitle } from "@f3/ui/card";

import type { F3MapSearchResult } from "~/utils/types";
import { isTouchDevice } from "~/utils/is-touch-device";
import { setView } from "~/utils/set-view";
import { appStore } from "~/utils/store/app";
import { drawerStore } from "~/utils/store/drawer";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import {
  selectedItemStore,
  setSelectedItem,
} from "~/utils/store/selected-item";
import { ImageWithFallback } from "../image-with-fallback";

export const onClickPlaceRowF3 = (result: F3MapSearchResult) => {
  console.log("onClickPlaceRowF3", result);
  searchStore.setState({ shouldShowResults: false });
  drawerStore.setState({ snap: SnapPoint["pt-150px"] });
  appStore.setState({ ignoreNextNearbyItemMouseEnter: true });
  selectedItemStore.setState({
    panelLocationId: null,
    panelEventId: null,
  });
  const latitude = result.destination.lat;
  const longitude = result.destination.lng;
  if (typeof latitude === "number" && typeof longitude === "number") {
    mapStore.setState({
      nearbyLocationCenter: {
        lat: latitude,
        lng: longitude,
        name: result.header,
      },
    });
    setView({ lat: latitude, lng: longitude });
    // Use a timeout to allow the map animation to finish
    setTimeout(() => {
      setSelectedItem({
        locationId: result.destination.item.locationId,
        eventId: result.destination.item.id,
      });
    }, 250);
  }
};

export const PlaceRowF3 = ({
  result,
  focused,
}: {
  result: F3MapSearchResult;
  focused?: boolean;
}) => {
  return (
    <button
      className="w-full"
      onMouseOver={() => {
        const isMobile = isTouchDevice();
        if (isMobile) {
          onClickPlaceRowF3(result);
        } else {
          setSelectedItem({
            locationId: result.destination.item.locationId,
            eventId: null,
          });
        }
      }}
      onFocus={() => {
        setSelectedItem({
          locationId: result.destination.item.locationId,
          eventId: null,
        });
      }}
      onClick={() => {
        onClickPlaceRowF3(result);
      }}
    >
      <CardHeader
        className={cn("flex-row items-center gap-2 p-2 hover:bg-foreground/5", {
          "bg-foreground/5": focused,
        })}
      >
        <ImageWithFallback
          loading="lazy"
          src={result.destination.logo || "/f3_logo.png"}
          fallbackSrc="/f3_logo.png"
          width={32}
          height={32}
          alt="item"
          className="rounded-sm bg-black"
        />
        <div className="flex-4 text-start">
          <CardTitle>{result.header}</CardTitle>
          {/* <CardDescription className="line-clamp-1">
            {result.description}
          </CardDescription> */}
        </div>
      </CardHeader>
    </button>
  );
};
