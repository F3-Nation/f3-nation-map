import { cn } from "@f3/ui";

import { useUserLocation } from "../map/user-location-provider";

export const UserLocationContent = () => {
  const { permissions, status, updateUserLocation } = useUserLocation();

  return (
    <div className="flex flex-col items-start gap-4 text-sm">
      {permissions === "denied"
        ? "Permissions have been denied. Please grant location permissions for your browser and try again"
        : // : permissions === "prompt"
          //   ? "Your location is being requested. Please grant location permissions for your browser and try again"
          status === "error"
          ? "There was an error loading your position"
          : status === "loading"
            ? "Your position is loading"
            : "Permissions have been granted. Press this to show your location"}
      {permissions !== "granted" ? (
        <button
          className={cn(
            "self-center rounded-md bg-foreground px-4 py-2 text-background shadow hover:bg-foreground/90",
          )}
          onClick={() => updateUserLocation()}
        >
          Request location permissions
        </button>
      ) : null}
    </div>
  );
};
