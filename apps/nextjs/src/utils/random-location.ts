import { queryClientUtils } from "~/trpc/react";

export const getRandomLocation = () => {
  const markers = queryClientUtils.location.getLocationMarkersSparse.getData();
  return markers?.[Math.floor(Math.random() * markers.length)];
};
