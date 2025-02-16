import Link from "next/link";
import { CircleHelp, Eye, Moon, Pencil, Sun, SunMoon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";

import { api } from "~/trpc/react";
import { appStore } from "~/utils/store/app";
import { mapStore } from "~/utils/store/map";
import { closeModal } from "~/utils/store/modal";

export default function SettingsModal() {
  const mode = appStore.use.mode();
  const tiles = mapStore.use.tiles();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { data: regions } = api.location.getRegions.useQuery();
  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg bg-muted lg:max-w-[400px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-start space-y-4 px-4 text-left">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md bg-card p-2 shadow-sm hover:bg-accent",
                  {
                    "bg-primary text-white hover:bg-primary/90":
                      theme === "light",
                  },
                )}
              >
                <Sun className="size-5" />
                <span className="text-xs">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md bg-card p-2 shadow-sm hover:bg-accent",
                  {
                    "bg-primary text-white hover:bg-primary/90":
                      theme === "dark",
                  },
                )}
              >
                <Moon className="size-5" />
                <span className="text-xs">Dark</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md bg-card p-2 shadow-sm hover:bg-accent",
                  {
                    "bg-primary text-white hover:bg-primary/90":
                      theme === "system",
                  },
                )}
              >
                <SunMoon className="size-5" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Map tiles
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => mapStore.setState({ tiles: "street" })}
                className={cn(
                  "relative flex flex-col items-center gap-1 overflow-hidden rounded-md border-2 border-transparent bg-card p-2 shadow-sm hover:bg-accent",
                  {
                    "bg-primary text-white hover:bg-primary/90":
                      tiles === "street",
                  },
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={"/street.jpg"}
                  alt={tiles}
                  className="absolute inset-0 -top-[50%] object-cover"
                />
                <Eye className="size-5" />
                <span className="text-xs">Street</span>
              </button>
              <button
                onClick={() => mapStore.setState({ tiles: "satellite" })}
                className={cn(
                  "relative flex flex-col items-center gap-1 overflow-hidden rounded-md border-2 border-transparent bg-card p-2 shadow-sm hover:bg-accent",
                  {
                    "bg-primary text-white hover:bg-primary/90":
                      tiles === "satellite",
                  },
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={"/satellite.jpg"}
                  alt={tiles}
                  className="absolute inset-0 -top-[50%] object-cover"
                />
                <Pencil className="size-5" />
                <span className="text-xs">Satellite</span>
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => appStore.setState({ mode: "view" })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md bg-card p-2 shadow-sm hover:bg-accent",
                  {
                    "bg-primary text-white hover:bg-primary/90":
                      mode === "view",
                  },
                )}
              >
                <Eye className="size-5" />
                <span className="text-xs">View</span>
              </button>
              <button
                disabled={!session}
                onClick={() => appStore.setState({ mode: "edit" })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md bg-card p-2 shadow-sm hover:bg-accent",
                  "disabled:pointer-events-none disabled:opacity-20",
                  {
                    "bg-blue-500 text-white hover:bg-blue-500/90":
                      mode === "edit",
                  },
                )}
              >
                <Pencil className="size-5" />
                <span className="text-xs">Edit</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {mode === "view"
                ? "(Default) View mode - View and filter workouts"
                : "Edit mode - Submit requests to add or edit workouts"}
            </p>
          </div>
          {!session ? (
            <Link href={"/api/auth/signin"}>
              <button
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md bg-primary p-2 text-white shadow-sm hover:bg-primary/90",
                  "text-center text-sm",
                  "w-full",
                )}
              >
                Sign in
              </button>
            </Link>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900">
                  Signed in as
                  <span className="ml-1 font-semibold text-primary">
                    {session.email}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Role: <span className="font-medium">{session.role}, </span>
                  Editing regions:{" "}
                  <span className="font-medium">
                    {session.editingRegionIds.map(
                      (id) => regions?.find((r) => r.id === id)?.name,
                    )}
                  </span>
                </p>
              </div>
              <Link href={"/api/auth/signout"}>
                <button
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md bg-primary p-2 text-white shadow-sm hover:bg-primary/90",
                    "text-center text-sm",
                    "w-full",
                  )}
                >
                  Sign out
                </button>
              </Link>
            </div>
          )}
          <div className="flex flex-col items-center justify-center gap-4">
            <Link
              className="flex w-full flex-col items-center gap-1 rounded-md bg-card p-2 shadow-sm hover:bg-accent"
              target="_blank"
              href={"/help"}
            >
              <CircleHelp className="size-5" />
              <span className="text-xs">Help / Feedback</span>
            </Link>
            <Link
              className="text-sm text-primary hover:text-primary/80"
              target="_blank"
              href={"https://f3nation.com/about-f3"}
            >
              FAQs
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
