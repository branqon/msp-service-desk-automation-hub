"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  size = "md",
}: {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "md" | "sm";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} size={size} disabled={pending}>
      {pending ? pendingLabel ?? "Working..." : label}
    </Button>
  );
}
