"use client";

import "~/utils/leaflet-canvas-markers"; // with modifications
import "~/utils/smooth-zoom-wheel"; // with modifications

import "leaflet/dist/leaflet.css";

import { LocateFixed } from "lucide-react";
import ReactDOMServer from "react-dom/server";
import { Marker, Pane } from "react-leaflet";

import { cn } from "@f3/ui";
import { Button } from "@f3/ui/button";

import { useUserLocation } from "./user-location-provider";

export const UserLocationIconAndMarker = () => {
  const { userLocation, updateUserLocation, status, permissions } =
    useUserLocation();

  return (
    <>
      <Pane name="user-location-marker" style={{ zIndex: 1000 }}>
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              iconSize: [24, 24],
              iconAnchor: [12, 12],
              className: "bg-transparent",
              html: ReactDOMServer.renderToString(
                <div className="bg-transparent">
                  <div className="flex h-6 w-6  items-center justify-center rounded-full bg-blue-500/30">
                    <div className="h-3 w-3 rounded-full border-[1px] border-white bg-blue-500" />
                  </div>
                </div>,
              ),
            })}
          />
        )}
      </Pane>
      <div
        className={"absolute right-4 top-4 flex flex-col lg:right-4"}
        style={{ zIndex: 400 }}
      >
        <Button
          variant="outline"
          size="icon"
          className="hover:bg-background focus:bg-background"
          onClick={updateUserLocation}
        >
          <div className={cn({ "animate-spin": status === "loading" })}>
            <LocateFixed className={cn("size-5 scale-100 text-foreground")} />
          </div>
        </Button>
        <div>{status}</div>
        <div>{permissions}</div>
      </div>
    </>
  );
};
