"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireStaff } from "@/lib/auth";
import {
  createTicket,
  replyToTicket,
  updateTicketStatus,
  type TicketStatus,
} from "@/lib/support";

export type SupportActionState = { ok: boolean; message: string; ticketId?: string };

export async function createTicketAction(
  _prev: SupportActionState,
  formData: FormData,
): Promise<SupportActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "برای ثبت تیکت ابتدا وارد حساب شوید." };

  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const priority = String(formData.get("priority") ?? "NORMAL").trim();
  const orderId = String(formData.get("orderId") ?? "").trim() || undefined;

  if (subject.length < 5) return { ok: false, message: "موضوع باید حداقل ۵ کاراکتر باشد." };
  if (message.length < 10) return { ok: false, message: "پیام باید حداقل ۱۰ کاراکتر باشد." };

  const ticketId = await createTicket({
    customerId: user.id,
    orderId,
    subject,
    message,
    priority: priority as any,
  });

  revalidatePath("/account/tickets");
  return {
    ok: true,
    message: "تیکت شما با موفقیت ثبت شد.",
    ticketId,
  };
}

export async function replyTicketAction(
  _prev: SupportActionState,
  formData: FormData,
): Promise<SupportActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "وارد حساب شوید." };

  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!ticketId || message.length < 3) {
    return { ok: false, message: "پیام نامعتبر است." };
  }

  await replyToTicket({
    ticketId,
    senderId: user.id,
    message,
    isStaff: user.role !== "CUSTOMER",
  });

  revalidatePath(`/account/tickets/${ticketId}`);
  if (user.role !== "CUSTOMER") revalidatePath("/admin/support");
  return { ok: true, message: "پاسخ شما ثبت شد." };
}

export async function updateTicketStatusAction(
  formData: FormData,
): Promise<SupportActionState> {
  await requireStaff();
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const status = String(formData.get("status") ?? "OPEN").trim() as TicketStatus;

  if (!ticketId) return { ok: false, message: "تیکت یافت نشد." };

  await updateTicketStatus(ticketId, status);
  revalidatePath("/admin/support");
  revalidatePath(`/account/tickets/${ticketId}`);
  return { ok: true, message: "وضعیت تیکت بروزرسانی شد." };
}
