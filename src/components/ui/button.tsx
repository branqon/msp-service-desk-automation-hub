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
      ? "bg-[#818cf8] text-white hover:bg-[#6366f1]"
      : variant === "secondary"
        ? "border border-white/10 bg-white/8 text-[#f1f1f4] hover:border-white/16 hover:bg-white/12"
        : variant === "danger"
          ? "bg-rose-800 text-white hover:bg-rose-900"
          : "text-[#8b8ba0] hover:bg-white/8";

  const sizeClass = size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm";

  return cn(
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-60",
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
