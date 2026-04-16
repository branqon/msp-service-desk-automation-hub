"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  size = "md",
  disabled = false,
}: {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "md" | "sm";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} size={size} disabled={pending || disabled}>
      {pending ? pendingLabel ?? "Working..." : label}
    </Button>
  );
}
