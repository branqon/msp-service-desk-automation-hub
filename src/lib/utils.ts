import { format, formatDistanceToNowStrict } from "date-fns";
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
) {
  if (!dueAt || isClosedStatus(status)) {
    return false;
  }

  return new Date(dueAt).getTime() < Date.now();
}

export function getSlaRiskLevel(
  dueAt: Date | string | null | undefined,
  status: string,
) {
  if (!dueAt || isClosedStatus(status)) {
    return "Healthy";
  }

  const diffMs = new Date(dueAt).getTime() - Date.now();
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
