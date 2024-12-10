import { clientUtils } from "~/trpc/server-side-react-helpers";

export const getRandomLocation = () => {
  const markers = clientUtils.location.getLocationMarkersSparse.getData();
  return markers?.[Math.floor(Math.random() * markers.length)];
};
