"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

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
  const mapRef = mapStore.use.ref();
  const userGpsLocation = mapStore.use.userGpsLocation();
  const [permissions, setPermissions] = useState<PermissionState | null>(null);
  const [status, setStatus] = useState(
    "loading" as "loading" | "error" | "success",
  );

  // Initial load
  useEffect(() => {
    setStatus("loading");
    void navigator.permissions.query({ name: "geolocation" }).then((result) => {
      setPermissions(result.state);
    });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus("success");
        mapStore.setState({
          userGpsLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      () => {
        setStatus("error");
        console.log("Error getting user location");
      },
    );
  }, []);

  const updateUserLocation = useCallback(() => {
    if (userGpsLocation) {
      mapRef.current?.setView(
        {
          lat: userGpsLocation.latitude,
          lng: userGpsLocation.longitude,
        },
        13,
      );
      return;
    }

    // Otherwise get the location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus("success");
        mapStore.setState({
          userGpsLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        if (position) {
          mapRef.current?.setView(
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            13,
          );
        }
      },
      () => {
        setStatus("error");
        console.log("Error getting user location");
      },
    );
  }, [mapRef, userGpsLocation]);

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

// Not in use
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
