"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SidebarNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="flex flex-wrap gap-1.5">
        {navigationItems.map((item) => {
          const active =
            item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-[var(--ink)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:bg-[var(--border-light)] hover:text-[var(--ink)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-px px-2">
      {navigationItems.map((item) => {
        const active =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative rounded-[5px] px-2.5 py-[7px] text-xs transition-colors",
              active
                ? "bg-white/10 text-[var(--sidebar-ink)]"
                : "text-[var(--sidebar-muted)] hover:bg-white/10 hover:text-[var(--sidebar-ink)]",
            )}
          >
            {active && (
              <span className="absolute left-0 top-[7px] bottom-[7px] w-0.5 rounded-r-sm bg-[var(--brand-mark)]" />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
