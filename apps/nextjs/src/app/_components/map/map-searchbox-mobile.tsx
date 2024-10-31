"use client";

import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, XCircle } from "lucide-react";

import type { ExpansionUserResponse } from "@f3/shared/app/schema/ExpansionUserSchema";
import { BreakPoints, DEFAULT_CENTER, Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { Input } from "@f3/ui/input";

import { api } from "~/trpc/react";
import { filterDataWithinMiles } from "~/utils/filtered-data";
import { getExpansionNearbyUsers } from "~/utils/get-expansion-nearby-users";
import { useOnKeyPress } from "~/utils/hooks/use-on-key-press";
import { onClickPlaceRowMap } from "~/utils/on-click-place-row-map";
import { placesAutocomplete } from "~/utils/place-autocomplete";
import { Responsive } from "~/utils/responsive";
import { filterStore } from "~/utils/store/filter";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import { isGeoMapSearchResult } from "~/utils/types";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import { useTextSearchResults } from "./search-results-provider";
import WithLove from "./with-love";

export function MapSearchBoxMobile({
  className,
  ...rest
}: ComponentProps<"div">) {
  const { latitude, longitude } = filterStore.get("position");
  const text = searchStore.use.text();
  const [isFocused, setIsFocused] = useState(false);
  const { combinedResults } = useTextSearchResults();
  const { locationOrderedLocationMarkers } = useFilteredMapResults();
  const locationWithinRadius = filterDataWithinMiles({
    data: locationOrderedLocationMarkers,
  });
  const hasLocationMarkers = locationWithinRadius?.length ?? 0 > 0;
  const { data: expansionUsers } =
    api.expansionUsers.getExpansionUsers.useQuery();

  const onSubmit = () => {
    const selectedResult = combinedResults[0];
    if (selectedResult && isGeoMapSearchResult(selectedResult)) {
      onClickPlaceRowMap(selectedResult);
    }
  };

  useEffect(() => {
    if (!hasLocationMarkers && expansionUsers) {
      getExpansionNearbyUsers({
        expansionUsers: expansionUsers as unknown as ExpansionUserResponse[],
      });
    }
  }, [hasLocationMarkers, expansionUsers, longitude, latitude]);

  const { ref: inputRef } = useOnKeyPress<HTMLInputElement>({
    keys: ["Enter"],
    cb: (key) => {
      if (key === "Enter") {
        onSubmit();
      }
    },
  });

  return (
    <Responsive maxWidth={BreakPoints.LG}>
      <div
        className={cn(
          "pointer-events-none absolute bottom-1 left-0 right-0",
          className,
        )}
        style={{ zIndex: Z_INDEX.MAP_SEARCHBOX_MOBILE }}
        {...rest}
      >
        <div
          className={cn(
            " grid grid-cols-[48px_1fr_48px] items-center transition-all",
            className,
          )}
          {...rest}
        >
          {/* Logo */}
          <Link
            href="https://f3nation.com/"
            target="_blank"
            className="pointer-events-auto mx-auto"
          >
            <Image
              src="/f3_logo.png"
              alt="F3 Logo"
              width={42}
              height={42}
              className="rounded-md"
            />
          </Link>
          {/* Search box component for the map */}
          <div className="pointer-events-auto relative w-full">
            <div className="pointer-events-none absolute left-2 top-[5px]">
              <Search className="text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search by location, zip, etc."
                onFocus={() => {
                  inputRef.current?.select();
                  setIsFocused(true);
                }}
                onBlur={() => {
                  setIsFocused(false);
                }}
                value={text}
                className="h-[34px] rounded-full bg-foreground pl-10 text-base text-background caret-background placeholder:text-muted-foreground"
                // enterKeyHint="done"
                onChange={(e) => {
                  searchStore.setState({
                    text: e.target.value,
                    shouldShowResults: true,
                  });

                  if (!e.target.value) {
                    searchStore.setState({ placesResults: [] });
                  } else if (e.target.value.length > 2) {
                    const center = mapStore.get("center") ?? {
                      lat: DEFAULT_CENTER[0] ?? 37.7937,
                      lng: DEFAULT_CENTER[1] ?? -122.3965,
                    };
                    const zoom = mapStore.get("zoom");
                    void placesAutocomplete({
                      input: e.target.value,
                      center,
                      zoom,
                    }).then((results) => {
                      searchStore.setState({ placesResults: results });
                    });
                  }
                }}
              />
              <WithLove />
            </div>
            {(text || isFocused) && (
              <button
                className="absolute right-2 top-[0.3rem]"
                onClick={() => {
                  searchStore.setState({ text: "", shouldShowResults: false });
                  setIsFocused(false);
                }}
              >
                <XCircle className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Responsive>
  );
}
