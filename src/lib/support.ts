import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { supportTickets, ticketReplies, users, siteSettings } from "@/db/schema";
import { newId } from "@/lib/auth";
import { sendEmail, htmlTemplate } from "@/lib/email";
import { SETTINGS_ID } from "@/lib/settings";

export type TicketStatus = "OPEN" | "ANSWERED" | "CLOSED";
export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "باز",
  ANSWERED: "پاسخ داده شده",
  CLOSED: "بسته شده",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "کم",
  NORMAL: "عادی",
  HIGH: "بالا",
  URGENT: "فوری",
};

export async function createTicket(params: {
  customerId: string;
  orderId?: string;
  subject: string;
  message: string;
  priority?: TicketPriority;
}): Promise<string> {
  const ticketId = newId();
  await db.insert(supportTickets).values({
    id: ticketId,
    customerId: params.customerId,
    orderId: params.orderId,
    subject: params.subject,
    message: params.message,
    priority: params.priority || "NORMAL",
  });

  const [user, settings] = await Promise.all([
    db.select().from(users).where(eq(users.id, params.customerId)).limit(1),
    db.select().from(siteSettings).where(eq(siteSettings.id, SETTINGS_ID)).limit(1),
  ]);

  if (user[0] && settings[0]) {
    const template = settings[0].supportEmailTemplate;
    const html = htmlTemplate(`
      <div class="header"><h1>درخواست پشتیبانی شما ثبت شد</h1></div>
      <p>سلام <strong>${user[0].name}</strong>،</p>
      <p>تیکت شماره <strong>#${ticketId.slice(0, 8)}</strong> با موضوع "<strong>${params.subject}</strong>" ثبت شده است.</p>
      <div class="alert success">
        <strong>وضعیت:</strong> منتظر بررسی<br/>
        <strong>اولویت:</strong> ${TICKET_PRIORITY_LABELS[params.priority || "NORMAL"]}
      </div>
      <p><strong>پیام شما:</strong></p>
      <p style="background: #f1f5f9; padding: 12px; border-radius: 8px; white-space: pre-wrap;">${params.message}</p>
      <p>ما در اسرع وقت به شما پاسخ خواهیم داد.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://zenoxweb.ir"}/account/tickets/${ticketId}" class="btn">مشاهده تیکت</a>
    `);

    await sendEmail({
      to: user[0].email,
      subject: `تیکت پشتیبانی #${ticketId.slice(0, 8)} - ${params.subject}`,
      html,
    });
  }

  return ticketId;
}

export async function replyToTicket(params: {
  ticketId: string;
  senderId: string;
  message: string;
  isStaff: boolean;
}): Promise<string> {
  const replyId = newId();
  await db.insert(ticketReplies).values({
    id: replyId,
    ticketId: params.ticketId,
    senderId: params.senderId,
    message: params.message,
    isStaff: params.isStaff,
  });

  await db
    .update(supportTickets)
    .set({
      status: "ANSWERED",
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, params.ticketId));

  const [ticket, sender, settings] = await Promise.all([
    db.select().from(supportTickets).where(eq(supportTickets.id, params.ticketId)).limit(1),
    db.select().from(users).where(eq(users.id, params.senderId)).limit(1),
    db.select().from(siteSettings).where(eq(siteSettings.id, SETTINGS_ID)).limit(1),
  ]);

  if (ticket[0]) {
    const recipientId = params.isStaff ? ticket[0].customerId : undefined;
    if (recipientId) {
      const [recipient] = await Promise.all([
        db.select().from(users).where(eq(users.id, recipientId)).limit(1),
      ]);

      if (recipient[0]) {
        const html = htmlTemplate(`
          <div class="header"><h1>پاسخ جدید برای تیکت شما</h1></div>
          <p>سلام <strong>${recipient[0].name}</strong>،</p>
          <p>پاسخ جدیدی برای تیکت <strong>#${params.ticketId.slice(0, 8)}</strong> ثبت شده است.</p>
          <p><strong>پاسخ از:</strong> ${sender[0]?.name || "تیم پشتیبانی"}</p>
          <p><strong>محتوا:</strong></p>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; white-space: pre-wrap;">${params.message}</div>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://zenoxweb.ir"}/account/tickets/${params.ticketId}" class="btn">مشاهده تیکت</a>
        `);

        await sendEmail({
          to: recipient[0].email,
          subject: `پاسخ جدید: تیکت #${params.ticketId.slice(0, 8)} - ${ticket[0].subject}`,
          html,
        });
      }
    }
  }

  return replyId;
}

export async function getTicket(ticketId: string, userId?: string) {
  const ticket = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1);

  if (!ticket[0]) return null;
  if (userId && ticket[0].customerId !== userId) return null;

  const [customer, replies] = await Promise.all([
    db.select().from(users).where(eq(users.id, ticket[0].customerId)).limit(1),
    db.select().from(ticketReplies).where(eq(ticketReplies.ticketId, ticketId)).orderBy(desc(ticketReplies.createdAt)),
  ]);

  const repliesWithSender = await Promise.all(
    replies.map(async (r) => {
      const [sender] = await db.select().from(users).where(eq(users.id, r.senderId)).limit(1);
      return { ...r, sender: sender?.name || "Unknown" };
    }),
  );

  return { ticket: ticket[0], customer: customer[0], replies: repliesWithSender.reverse() };
}

export async function getCustomerTickets(customerId: string) {
  return db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.customerId, customerId))
    .orderBy(desc(supportTickets.updatedAt));
}

export async function getAllTickets() {
  const rows = await db
    .select({
      ticket: supportTickets,
      customer: users,
    })
    .from(supportTickets)
    .innerJoin(users, eq(supportTickets.customerId, users.id))
    .orderBy(desc(supportTickets.updatedAt));

  return rows.map((r) => ({ ...r.ticket, customerName: r.customer.name, customerEmail: r.customer.email }));
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  await db
    .update(supportTickets)
    .set({ status, updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId));
}
