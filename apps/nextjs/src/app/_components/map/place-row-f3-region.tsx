import { cn } from "@f3/ui";
import { CardDescription, CardHeader, CardTitle } from "@f3/ui/card";

import type { F3RegionMapSearchResult } from "~/utils/types";
import { isTouchDevice } from "~/utils/is-touch-device";
import { setView } from "~/utils/set-view";
import { filterStore } from "~/utils/store/filter";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import { setSelectedItem } from "~/utils/store/selected-item";
import { ImageWithFallback } from "../image-with-fallback";

export const onClickF3RegionRow = (result: F3RegionMapSearchResult) => {
  searchStore.setState({ shouldShowResults: false });
  setSelectedItem({ locationId: null, eventId: null });
  mapStore.setState({
    placeResultArea: result.header,
    placeResultLocation: {
      lat: result.destination.lat,
      lng: result.destination.lng,
    },
    nearbyLocationCenter: {
      lat: result.destination.lat,
      lng: result.destination.lng,
      name: result.header,
    },
  });
  setView({ lat: result.destination.lat, lng: result.destination.lng });
  setTimeout(() => {
    mapStore.get("ref").current?.invalidateSize();
  }, 0);
  filterStore.setState({
    position: {
      latitude: result.destination.lat,
      longitude: result.destination.lng,
    },
  });
};

export const PlaceRowF3Region = ({
  result,
  focused,
}: {
  result: F3RegionMapSearchResult;
  focused?: boolean;
}) => {
  return (
    <button
      className="w-full"
      onMouseOver={() => {
        const isMobile = isTouchDevice();
        if (isMobile) {
          onClickF3RegionRow(result);
        } else {
          setSelectedItem({
            locationId: result.destination.locationId,
            eventId: null,
          });
        }
      }}
      onFocus={() => {
        setSelectedItem({
          locationId: result.destination.locationId,
          eventId: null,
        });
      }}
      onClick={() => {
        onClickF3RegionRow(result);
      }}
    >
      <CardHeader
        className={cn("flex-row items-center gap-2 p-2 hover:bg-foreground/5", {
          "bg-foreground/5": focused,
        })}
      >
        <ImageWithFallback
          loading="lazy"
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          src={result.destination.logo || "/f3_logo.png"}
          fallbackSrc="/f3_logo.png"
          width={32}
          height={32}
          alt="item"
          className="rounded-sm bg-black"
        />
        <div className="flex-4 text-start">
          <CardTitle>{result.header}</CardTitle>
          <CardDescription className="line-clamp-1">F3 Region</CardDescription>
        </div>
      </CardHeader>
    </button>
  );
};
