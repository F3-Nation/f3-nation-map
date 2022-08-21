"use client";

import type { ComponentProps } from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import { XCircle } from "lucide-react";

import { cn } from "@f3/ui";
import { Input } from "@f3/ui/input";

import { placesAutocomplete } from "~/utils/place-autocomplete";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";

export function MapSearchBoxMobile({
  className,
  hideLogo,
  ...rest
}: ComponentProps<"div"> & { hideLogo?: true }) {
  const text = searchStore.use.text();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2 px-2 transition-all",
        className,
      )}
      {...rest}
    >
      {/* Logo */}
      {hideLogo ? null : (
        <Image src={"/f3_logo.png"} height={42} width={42} alt="F3 logo" />
      )}
      {/* Search box component for the map */}
      <div className="relative w-full">
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
          className="h-[42px] rounded-full bg-foreground text-base text-background caret-background placeholder:text-muted-foreground"
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
            <XCircle color="#aaa" />
          </button>
        )}
      </div>
    </div>
  );
}
