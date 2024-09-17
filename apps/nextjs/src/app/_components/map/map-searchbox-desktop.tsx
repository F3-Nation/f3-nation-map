"use client";

import type { ComponentProps } from "react";
import { useCallback, useRef, useState } from "react";
import { Search, XCircle } from "lucide-react";

import { SnapPoint, Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { Input } from "@f3/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@f3/ui/popover";
import { Spinner } from "@f3/ui/spinner";

import { useOnKeyPress } from "~/utils/hooks/use-on-key-press";
import { onClickPlaceRowMap } from "~/utils/on-click-place-row-map";
import { placesAutocomplete } from "~/utils/place-autocomplete";
import { drawerStore } from "~/utils/store/drawer";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import { isF3MapSearchResult } from "~/utils/types";
import { onClickPlaceRowF3, PlaceRowF3 } from "./place-row-f3";
import { PlaceRowMap } from "./place-row-map";
import { useTextSearchResults } from "./search-results-provider";

export function MapSearchBox({
  className,
  ...rest
}: ComponentProps<"div"> & { hideLogo?: true }) {
  const text = searchStore.use.text();
  const [isFocused, setIsFocused] = useState(false);
  const { combinedResults } = useTextSearchResults();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const shouldRedirectOnResult = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const { ref: inputRef } = useOnKeyPress<HTMLInputElement>({
    keys: ["Enter"],
    cb: (key) => {
      if (key === "Enter") {
        onSubmit();
      }
    },
  });

  const onSubmit = useCallback(() => {
    const selectedResult = combinedResults[focusedIndex];
    if (selectedResult) {
      if (isF3MapSearchResult(selectedResult)) {
        onClickPlaceRowF3(selectedResult);
      } else {
        onClickPlaceRowMap(selectedResult);
      }
      if (inputRef.current) {
        searchStore.setState({ text: selectedResult.header });
        inputRef.current.blur();
      }
    }
  }, [combinedResults, focusedIndex, inputRef]);

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-4 px-4 transition-all",
        className,
      )}
      {...rest}
    >
      <div className="relative w-full">
        <Popover open={isFocused}>
          <PopoverTrigger className="w-full">
            <Input
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  setFocusedIndex((prev) =>
                    Math.min(prev + 1, combinedResults.length - 1),
                  );
                  e.preventDefault();
                } else if (e.key === "ArrowUp") {
                  setFocusedIndex((prev) => Math.max(prev - 1, 0));
                  e.preventDefault();
                }
              }}
              ref={inputRef}
              aria-expanded={isFocused}
              type="text"
              placeholder="Search by location, zip, etc."
              onFocus={() => {
                setIsFocused(true);
                setFocusedIndex(0);
              }}
              onBlur={() => {
                setIsFocused(false);
              }}
              value={text}
              className="h-[42px] w-full rounded-full bg-foreground pl-10 text-base text-background caret-background placeholder:text-background/60"
              onChange={(e) => {
                setIsLoading(true);
                shouldRedirectOnResult.current = true;
                searchStore.setState({ text: e.target.value });

                if (!e.target.value) {
                  searchStore.setState({ placesResults: [] });
                } else if (e.target.value.length > 2) {
                  void placesAutocomplete({
                    input: e.target.value,
                    center: mapStore.get("center") ?? {
                      lat: 37.7937,
                      lng: -122.3965,
                    },
                    zoom: mapStore.get("zoom"),
                  }).then((results) => {
                    setIsLoading(false);
                    searchStore.setState({ placesResults: results });
                  });
                }
              }}
              onSubmit={() => onSubmit()}
            />
            <div className="pointer-events-none absolute left-3 top-2">
              <Search color="#aaa" />
            </div>
            <div className="absolute right-2 top-2 flex flex-row items-center gap-2">
              {isLoading && <Spinner className="h-4 w-4 border-2" />}
              {text && (
                <button
                  onClick={() => {
                    searchStore.setState({ text: "" });
                    drawerStore.setState({ snap: SnapPoint["pt-150px"] });
                  }}
                >
                  <XCircle color="#aaa" />
                </button>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            className={cn("h-[400px] overflow-scroll p-0")}
            style={{
              zIndex: Z_INDEX.MAP_SEARCHBOX_POPOVER_CONTENT_DESKTOP,
              width: inputRef.current?.clientWidth,
            }}
          >
            {combinedResults.length === 0 ? (
              <div className="mt-4 w-full text-center">
                Search for a place or F3 workout
              </div>
            ) : (
              combinedResults
                .slice(0, 30)
                .map((result, index) =>
                  isF3MapSearchResult(result) ? (
                    <PlaceRowF3
                      key={result.destination.id}
                      result={result}
                      focused={focusedIndex === index}
                    />
                  ) : (
                    <PlaceRowMap
                      key={result.destination.id}
                      result={result}
                      focused={focusedIndex === index}
                    />
                  ),
                )
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
