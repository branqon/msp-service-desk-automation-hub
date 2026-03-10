import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger";
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
      ? "bg-[var(--ink)] text-white hover:bg-[var(--ink-80)]"
      : variant === "danger"
        ? "bg-[var(--red)] text-white hover:bg-[#a8293a]"
        : "border border-[var(--border)] bg-[var(--card)] text-[var(--ink-60)] hover:border-[var(--whisper)] hover:text-[var(--ink)]";

  const sizeClass = size === "sm" ? "h-8 px-3 text-[11.5px]" : "h-9 px-4 text-[11.5px]";

  return cn(
    "inline-flex items-center justify-center rounded-[5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/20 disabled:pointer-events-none disabled:opacity-50",
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
