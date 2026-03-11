import { format, formatDistanceStrict, formatDistanceToNowStrict } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return format(new Date(value), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeTime(value: Date | string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function formatRelativeTimeFrom(
  value: Date | string | null | undefined,
  referenceTime: Date | string,
) {
  if (!value) {
    return "Not set";
  }

  return formatDistanceStrict(new Date(value), new Date(referenceTime), {
    addSuffix: true,
  });
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatMinutes(value: number) {
  if (value < 60) {
    return `${value} min`;
  }

  const hours = value / 60;

  if (Number.isInteger(hours)) {
    return `${hours} hr`;
  }

  return `${hours.toFixed(1)} hr`;
}

export function isClosedStatus(status: string) {
  return status === "RESOLVED" || status === "CLOSED";
}

export function isOverdue(
  dueAt: Date | string | null | undefined,
  status: string,
  referenceTime?: Date | string,
) {
  if (!dueAt || isClosedStatus(status)) {
    return false;
  }

  const comparisonTime = referenceTime ? new Date(referenceTime).getTime() : Date.now();

  return new Date(dueAt).getTime() < comparisonTime;
}

export function getSlaRiskLevel(
  dueAt: Date | string | null | undefined,
  status: string,
  referenceTime?: Date | string,
) {
  if (!dueAt || isClosedStatus(status)) {
    return "Healthy";
  }

  const comparisonTime = referenceTime ? new Date(referenceTime).getTime() : Date.now();
  const diffMs = new Date(dueAt).getTime() - comparisonTime;
  const diffMinutes = diffMs / 60000;

  if (diffMinutes < 0) {
    return "Breached";
  }

  if (diffMinutes <= 60) {
    return "At Risk";
  }

  if (diffMinutes <= 240) {
    return "Watching";
  }

  return "Healthy";
}

export function formatCompactDate(value: Date | string) {
  return format(new Date(value), "MMM d");
}
