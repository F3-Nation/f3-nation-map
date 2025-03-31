"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { DEFAULT_CENTER } from "@acme/shared/app/constants";
import { RERENDER_LOGS } from "@acme/shared/common/constants";

import { getRandomLocation } from "~/utils/random-location";
import { setView } from "~/utils/set-view";
import { mapStore } from "~/utils/store/map";

const UserLocationContext = createContext<{
  userLocation: { latitude: number; longitude: number } | null;
  status: "loading" | "error" | "success";
  permissions: PermissionState | null;
  updateUserLocation: () => void;
}>({
  userLocation: null,
  permissions: null,
  status: "loading",
  updateUserLocation: () => undefined,
});

export const UserLocationProvider = ({ children }: { children: ReactNode }) => {
  RERENDER_LOGS && console.log("UserLocationProvider rerender");
  const userGpsLocation = mapStore.use.userGpsLocation();
  const [permissions, setPermissions] = useState<PermissionState | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  const setUserGpsLocation = useCallback((position: GeolocationPosition) => {
    mapStore.setState({
      nearbyLocationCenter: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        name: "you",
        type: "self",
      },

      userGpsLocation: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    });
  }, []);

  const handlePermissions = useCallback((result: PermissionStatus) => {
    console.log(
      "UserLocationProvider navigator.permissions.query result",
      result,
    );
    setPermissions(result.state);
    if (result.state === "denied") {
      setStatus("error");
      // Set the nearbyLocationCenter to a random location
      const randomLocation = getRandomLocation();
      console.log("randomLocation", randomLocation);
      if (
        typeof randomLocation?.lat === "number" &&
        typeof randomLocation?.lon === "number"
      ) {
        mapStore.setState({
          nearbyLocationCenter: {
            lat: randomLocation.lat,
            lng: randomLocation.lon,
            name: "random",
            type: "random",
          },
        });
      }
    } else {
      setStatus("success");
    }
  }, []);

  const handlePermissionsCatch = useCallback(() => {
    setStatus("error");
    console.log("Error getting user location");
  }, []);

  const updateUserLocation = useCallback(
    (params?: { onlyUpdateIfNotHasMovedMap?: boolean }) => {
      console.log("updateUserLocation", params);
      // one function to set the view and check if the map has moved
      const setViewIfNotMovedMap = (loc: { lat: number; lng: number }) => {
        const mapStoreValues = mapStore.getState();
        const hasMovedMap =
          mapStoreValues.hasMovedMap ||
          (mapStoreValues.center.lat !== DEFAULT_CENTER[0] &&
            mapStoreValues.center.lng !== DEFAULT_CENTER[1]);

        if (params?.onlyUpdateIfNotHasMovedMap && hasMovedMap) {
          console.log("Not redirecting because we've moved the map");
          return;
        }
        setView(loc);
      };
      console.log("userGpsLocation", userGpsLocation);
      if (userGpsLocation) {
        setViewIfNotMovedMap({
          lat: userGpsLocation.latitude,
          lng: userGpsLocation.longitude,
        });
        mapStore.setState({
          nearbyLocationCenter: {
            lat: userGpsLocation.latitude,
            lng: userGpsLocation.longitude,
            name: "you",
            type: "self",
          },
        });
        return;
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPermissions("granted");
            setStatus("success");
            setUserGpsLocation(position);
            setViewIfNotMovedMap({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            setStatus("error");
            console.log("Error getting user location");
          },
        );
      }
    },
    [setUserGpsLocation, userGpsLocation],
  );

  // Initial load
  useEffect(() => {
    console.log("UserLocationProvider useEffect");
    setStatus("loading");
    void navigator.permissions
      .query({ name: "geolocation" })
      .then(handlePermissions)
      .catch(handlePermissionsCatch);
  }, [handlePermissions, handlePermissionsCatch]);

  useEffect(() => {
    if (!permissions || permissions === "denied") return;

    // Don't automatically redirect if we've moved the map more than 10 meters
    console.log("Automatically updating user location");

    updateUserLocation({ onlyUpdateIfNotHasMovedMap: true });
  }, [permissions, updateUserLocation]);

  return (
    <UserLocationContext.Provider
      value={{
        userLocation: userGpsLocation,
        permissions,
        status,
        updateUserLocation,
      }}
    >
      {children}
    </UserLocationContext.Provider>
  );
};

export const useUserLocation = () => {
  return useContext(UserLocationContext);
};
// const userInitialIpLocation = mapStore.use.userInitialIpLocation();

// const userLocation = userGpsLocation ?? userInitialIpLocation;

// TODO: Orchestrate these two location requests
// Only get the ip location if the user location is not yet permitted, is not being requested, or failed

// Try to get the location right away

// useEffect(() => {
//   if (hasRequestedLocation.current) return;
//   hasRequestedLocation.current = true;

//   void axios
//     .get<{
//       ip: string;
//     }>("https://api64.ipify.org?format=json")
//     .then((res) => res.data)
//     .then((data) =>
//       axios.get<{
//         geoplugin_status: number; // 200;
//         geoplugin_request: string; // "71.71.123.153";
//         geoplugin_delay: string; // "1ms";
//         geoplugin_credit: string; // "Some of the returned data includes GeoLite2 data created by MaxMind, available from <a href='https://www.maxmind.com'>https://www.maxmind.com</a>.";
//         geoplugin_city: string; // "Elkin";
//         geoplugin_region: string; // "North Carolina";
//         geoplugin_regionCode: string; // "NC";
//         geoplugin_regionName: string; // "North Carolina";
//         geoplugin_areaCode: string; // "";
//         geoplugin_dmaCode: string; // "518";
//         geoplugin_countryCode: string; // "US";
//         geoplugin_countryName: string; // "United States";
//         geoplugin_inEU: number; // 0;
//         geoplugin_euVATrate: boolean; //false;
//         geoplugin_continentCode: string; // "NA";
//         geoplugin_continentName: string; // "North America";
//         geoplugin_latitude: string; // "36.2867";
//         geoplugin_longitude: string; // "-80.86";
//         geoplugin_locationAccuracyRadius: string; // "5";
//         geoplugin_timezone: string; // "America/New_York";
//         geoplugin_currencyCode: string; // "USD";
//         geoplugin_currencySymbol: string; // "$";
//         geoplugin_currencySymbol_UTF8: string; // "$";
//         geoplugin_currencyConverter: number; // 0;
//       }>(`http://www.geoplugin.net/json.gp?ip=${data.ip}`),
//     )
//     .then((res) => {
//       const latitude = safeParseFloat(res.data.geoplugin_latitude);
//       const longitude = safeParseFloat(res.data.geoplugin_longitude);
//       if (longitude !== undefined && latitude !== undefined) {
//         mapStore.setState({
//           userInitialIpLocation: {
//             latitude,
//             longitude,
//           },
//         });
//       }
//     });
// }, []);
