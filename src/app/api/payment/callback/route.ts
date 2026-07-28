import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, transactions } from "@/db/schema";
import { getSettings } from "@/lib/settings";

/** بازگشت از درگاه زرین‌پال و تایید تراکنش */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order") ?? "";
  const authority = url.searchParams.get("Authority") ?? "";
  const status = url.searchParams.get("Status") ?? "";

  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.orderId, orderId), eq(transactions.authority, authority)))
    .limit(1);
  const tx = rows[0];

  if (!tx || status !== "OK") {
    if (tx) await db.update(transactions).set({ status: "FAILED" }).where(eq(transactions.id, tx.id));
    return NextResponse.redirect(new URL(`/account/orders/${orderId}`, url.origin));
  }

  const settings = await getSettings();
  const merchantId = settings.gatewayMerchantId || process.env.ZARINPAL_MERCHANT_ID || "";
  let refId: string | null = null;

  try {
    const res = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant_id: merchantId, amount: tx.amount * 10, authority }),
    });
    const data = (await res.json()) as { data?: { ref_id?: number; code?: number } };
    if (data?.data?.code === 100 || data?.data?.code === 101) {
      refId = String(data.data.ref_id ?? authority);
    }
  } catch (error) {
    console.error("verify failed", error);
  }

  if (refId) {
    await db.update(transactions).set({ status: "SUCCESS", refId }).where(eq(transactions.id, tx.id));
    await db
      .update(orders)
      .set({ status: "PAID", paidAt: new Date(), paymentRefId: refId, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  } else {
    await db.update(transactions).set({ status: "FAILED" }).where(eq(transactions.id, tx.id));
  }

  return NextResponse.redirect(new URL(`/account/orders/${orderId}`, url.origin));
}
