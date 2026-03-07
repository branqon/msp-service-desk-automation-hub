"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createTicket,
  decideApproval,
  requestApprovalForTicket,
  reviewCustomerUpdate,
} from "@/lib/service-desk";

export type ActionResult = { error?: string };

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function friendlyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

export async function createTicketAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let ticketId: string;

  try {
    const ticket = await createTicket({
      companyId: String(formData.get("companyId") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      issueType: String(formData.get("issueType") ?? ""),
      urgency: String(formData.get("urgency") ?? ""),
      impact: String(formData.get("impact") ?? ""),
      description: String(formData.get("description") ?? ""),
      requesterName: String(formData.get("requesterName") ?? ""),
      requesterEmail: String(formData.get("requesterEmail") ?? ""),
      requesterTitle: String(formData.get("requesterTitle") ?? ""),
      attachmentsNote: String(formData.get("attachmentsNote") ?? ""),
      requesterVip: parseCheckbox(formData.get("requesterVip")),
    });

    ticketId = ticket.id;
  } catch (error) {
    return { error: friendlyError(error) };
  }

  revalidatePath("/");
  revalidatePath("/tickets");
  revalidatePath("/approvals");
  revalidatePath("/automation-opportunities");

  redirect(`/tickets/${ticketId}`);
}

export async function requestApprovalAction(
  ticketId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requestApprovalForTicket(ticketId, {
      approvalType: String(formData.get("approvalType") ?? ""),
      requestedBy: String(formData.get("requestedBy") ?? ""),
      reason: String(formData.get("reason") ?? ""),
    });
  } catch (error) {
    return { error: friendlyError(error) };
  }

  revalidatePath("/");
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/approvals");

  return {};
}

export async function reviewCustomerUpdateAction(
  ticketId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await reviewCustomerUpdate(ticketId, {
      reviewerName: String(formData.get("reviewerName") ?? ""),
      customerUpdateDraft: String(formData.get("customerUpdateDraft") ?? ""),
    });
  } catch (error) {
    return { error: friendlyError(error) };
  }

  revalidatePath("/");
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);

  return {};
}

export async function decideApprovalAction(
  approvalId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await decideApproval(approvalId, {
      decision: String(formData.get("decision") ?? ""),
      approverName: String(formData.get("approverName") ?? ""),
      decisionNotes: String(formData.get("decisionNotes") ?? ""),
    });
  } catch (error) {
    return { error: friendlyError(error) };
  }

  revalidatePath("/");
  revalidatePath("/tickets");
  revalidatePath("/approvals");

  return {};
}
