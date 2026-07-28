"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { hostingPlans, orders } from "@/db/schema";
import { getCurrentUser, newId } from "@/lib/auth";
import { startPayment } from "@/lib/payments";
import { getSettings } from "@/lib/settings";

export type OrderActionState = { ok: boolean; message: string };

type CartPayloadItem = { templateId: string; hostingPlanId: string; notes: string };

export async function submitCartAction(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "برای ثبت درخواست ابتدا وارد حساب کاربری شوید." };
  if (!user.phoneVerified || !user.emailVerified) {
    return { ok: false, message: "برای ثبت سفارش باید موبایل و ایمیل خود را تایید کنید." };
  }

  let items: CartPayloadItem[] = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]")) as CartPayloadItem[];
  } catch {
    return { ok: false, message: "اطلاعات سبد خرید نامعتبر است." };
  }
  if (items.length === 0) return { ok: false, message: "سبد خرید خالی است." };

  for (const item of items) {
    if (!item.templateId || !item.hostingPlanId) {
      return { ok: false, message: "برای هر قالب باید پلن سرور انتخاب شود." };
    }
    const plan = (
      await db.select().from(hostingPlans).where(eq(hostingPlans.id, item.hostingPlanId)).limit(1)
    )[0];
    if (!plan) return { ok: false, message: "پلن سرور انتخابی معتبر نیست." };

    await db.insert(orders).values({
      id: newId(),
      customerId: user.id,
      templateId: item.templateId,
      hostingPlanId: item.hostingPlanId,
      customizationNotes: (item.notes ?? "").slice(0, 2000),
      hostingPrice: plan.monthlyCost,
      status: "AWAITING_QUOTE",
    });
  }

  revalidatePath("/account");
  return { ok: true, message: "درخواست شما ثبت شد. پس از بررسی، پیش‌فاکتور برای شما صادر می‌شود." };
}

export async function approveQuoteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const orderId = String(formData.get("orderId") ?? "");
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.customerId, user.id)))
    .limit(1);
  const order = rows[0];
  if (!order || order.status !== "QUOTED") redirect("/account");

  await db
    .update(orders)
    .set({ status: "APPROVED_BY_CUSTOMER", approvedAt: new Date(), updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath(`/account/orders/${orderId}`);
  redirect(`/account/orders/${orderId}`);
}

export async function payOrderAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const orderId = String(formData.get("orderId") ?? "");
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.customerId, user.id)))
    .limit(1);
  const order = rows[0];
  if (!order || order.status !== "APPROVED_BY_CUSTOMER" || !order.totalPrice) {
    redirect(`/account/orders/${orderId}`);
  }

  const settings = await getSettings();
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const result = await startPayment({
    orderId: order.id,
    amount: order.totalPrice as number,
    baseUrl: `${proto}://${host}`,
    merchantId: settings.gatewayMerchantId || undefined,
    description: `سفارش ${order.id}`,
  });
  redirect(result.redirectUrl);
}
