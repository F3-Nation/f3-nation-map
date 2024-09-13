"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, XCircle } from "lucide-react";

import { BreakPoints, Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { Input } from "@f3/ui/input";

import { useOnKeyPress } from "~/utils/hooks/use-on-key-press";
import { onClickPlaceRowMap } from "~/utils/on-click-place-row-map";
import { placesAutocomplete } from "~/utils/place-autocomplete";
import { Responsive } from "~/utils/responsive";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import { isGeoMapSearchResult } from "~/utils/types";
import { useTextSearchResults } from "./search-results-provider";

export function MapSearchBoxMobile({
  className,
  ...rest
}: ComponentProps<"div">) {
  const text = searchStore.use.text();
  const [isFocused, setIsFocused] = useState(false);
  const { combinedResults } = useTextSearchResults();

  const onSubmit = () => {
    const selectedResult = combinedResults[0];
    if (selectedResult && isGeoMapSearchResult(selectedResult)) {
      onClickPlaceRowMap(selectedResult);
    }
  };

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
            <Image src="/f3_logo.png" alt="F3 Logo" width={42} height={42} />
          </Link>
          {/* Search box component for the map */}
          <div className="pointer-events-auto relative w-full">
            <div className="pointer-events-none absolute left-3 top-2">
              <Search className="text-muted-foreground" />
            </div>
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
              className="h-[42px] rounded-full bg-foreground pl-10 text-base text-background caret-background placeholder:text-muted-foreground"
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
                    lat: 37.7937,
                    lng: -122.3965,
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
            {(text || isFocused) && (
              <button
                className="absolute right-2 top-2"
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
