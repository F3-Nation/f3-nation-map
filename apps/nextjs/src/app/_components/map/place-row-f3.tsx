import { CLOSE_ZOOM, SnapPoint } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { CardDescription, CardHeader, CardTitle } from "@f3/ui/card";

import type { F3MapSearchResult } from "~/utils/types";
import { drawerStore } from "~/utils/store/drawer";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import { selectedItemStore } from "~/utils/store/selected-item";
import { ImageWithFallback } from "../image-with-fallback";

export const onClickPlaceRowF3 = (result: F3MapSearchResult) => {
  searchStore.setState({ shouldShowResults: false });
  drawerStore.setState({ snap: SnapPoint["pt-150px"] });
  const latitude = result.destination.lat;
  const longitude = result.destination.lng;
  if (typeof latitude === "number" && typeof longitude === "number") {
    mapStore
      .get("ref")
      .current?.setView({ lat: latitude, lng: longitude }, CLOSE_ZOOM, {
        animate: mapStore.get("zoom") === CLOSE_ZOOM,
      });
    selectedItemStore.setState({
      locationId: result.destination.item.locationId,
      eventId: result.destination.item.id,
    });
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
        selectedItemStore.setState({
          locationId: result.destination.item.locationId,
          eventId: null,
        });
      }}
      onFocus={() => {
        selectedItemStore.setState({
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
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- could be ''
          src={result.destination.item.logo || "/f3_logo.png"}
          fallbackSrc="/f3_logo.png"
          width={32}
          height={32}
          alt="item"
        />
        <div className="flex-4 text-start">
          <CardTitle>{result.header}</CardTitle>
          <CardDescription className="line-clamp-1">
            {result.description}
          </CardDescription>
        </div>
      </CardHeader>
    </button>
  );
};
