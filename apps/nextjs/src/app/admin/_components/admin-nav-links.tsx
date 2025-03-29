import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Earth,
  Globe,
  MapPin,
  PersonStanding,
  SquareChartGantt,
  User,
} from "lucide-react";

import { routes } from "@acme/shared/app/constants";
import { cn } from "@acme/ui";

interface AdminNavLinksProps {
  className?: string;
  linkClassName?: string;
}

export const AdminNavLinks = ({
  className,
  linkClassName,
}: AdminNavLinksProps) => {
  const pathname = usePathname();

  const links = [
    {
      href: routes.admin.users.__path,
      icon: User,
      label: "Users",
    },
    {
      href: routes.admin.requests.__path,
      icon: SquareChartGantt,
      label: "Requests",
    },
    {
      href: routes.admin.locations.__path,
      icon: MapPin,
      label: "Locations (BETA)",
    },
    {
      href: routes.admin.workouts.__path,
      icon: PersonStanding,
      label: "Events (BETA)",
    },
    {
      href: routes.admin.aos.__path,
      icon: Globe,
      label: "AOs (BETA)",
    },
    {
      href: routes.admin.regions.__path,
      icon: Globe,
      label: "Regions (BETA)",
    },
    {
      href: routes.admin.areas.__path,
      icon: Earth,
      label: "Areas (BETA)",
    },
    {
      href: routes.admin.sectors.__path,
      icon: Earth,
      label: "Sectors (BETA)",
    },
    {
      href: routes.admin.theNation.__path,
      icon: Earth,
      label: "The Nation (BETA)",
    },
  ];

  return (
    <div className={className}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium",
              pathname === link.href ? "bg-[#D6D6D6]" : "",
              linkClassName,
            )}
            href={link.href}
          >
            <Icon className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
};
