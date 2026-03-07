import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const variantClass =
    variant === "primary"
      ? "bg-[#0f766e] text-white hover:bg-[#115e59]"
      : variant === "secondary"
        ? "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
        : variant === "danger"
          ? "bg-rose-700 text-white hover:bg-rose-800"
          : "text-slate-700 hover:bg-slate-100";

  const sizeClass = size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm";

  return cn(
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/50 disabled:pointer-events-none disabled:opacity-60",
    variantClass,
    sizeClass,
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={buttonStyles({ variant, size, className })} {...props} />;
}
