import Link from "next/link";
import { HelpCircle } from "lucide-react";

import { filterButtonClassName } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";

export const HelpButton = () => {
  return (
    <Link
      href="/help?back=%2Fmap"
      className={cn(filterButtonClassName, "w-full whitespace-nowrap")}
    >
      <HelpCircle strokeWidth={2} className={cn("size-4")} />
      <div className="whitespace-nowrap">Help / feedback</div>
    </Link>
  );
};
