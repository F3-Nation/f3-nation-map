"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { cn } from "@f3/ui";

import { F3Logo } from "../_components/map/f3-logo";

export const Header = () => {
  const back = useSearchParams()?.get("back");

  return (
    <div className="flex items-center gap-4">
      {back ? (
        <Link href={back} className={cn("test")}>
          <ArrowLeft />
        </Link>
      ) : null}
      <F3Logo />
      <div className="flex flex-col">
        <div className="text-3xl font-bold">Nation Map</div>
        <div className="text-sm text-muted-foreground">
          Report an issue or request a feature
        </div>
      </div>
    </div>
  );
};
