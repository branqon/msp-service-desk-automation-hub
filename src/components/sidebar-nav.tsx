"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SidebarNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-2", mobile ? "overflow-x-auto" : "flex-col")}>
      {navigationItems.map((item) => {
        const active =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-2xl border px-4 py-3 transition-colors",
              mobile ? "min-w-[220px]" : "w-full",
              active
                ? "border-indigo-400/30 bg-indigo-500/15 text-[#f1f1f4]"
                : "border-transparent text-[#8b8ba0] hover:border-white/6 hover:bg-white/5 hover:text-[#f1f1f4]",
            )}
          >
            <div className="text-sm font-semibold">{item.label}</div>
            <div className="mt-1 text-xs leading-5 text-[#5f5f78]">{item.caption}</div>
          </Link>
        );
      })}
    </nav>
  );
}
