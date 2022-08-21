import { groupMarkersByLocation } from "@f3/shared/app/functions";
import { mapData } from "@f3/shared/app/mock";

export const organizedMapData = groupMarkersByLocation(mapData);
