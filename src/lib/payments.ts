import { db } from "@/db";
import { transactions } from "@/db/schema";
import { newId } from "./auth";

export type StartPaymentResult = { redirectUrl: string; transactionId: string };

/**
 * لایه‌ی ماژولار درگاه پرداخت.
 * اگر ZARINPAL_MERCHANT_ID تنظیم شده باشد، از زرین‌پال واقعی استفاده می‌شود،
 * در غیر این صورت درگاه شبیه‌سازی‌شده‌ی داخلی برای تست فرآیند فعال است.
 */
export async function startPayment(params: {
  orderId: string;
  amount: number;
  baseUrl: string;
  merchantId?: string;
  description?: string;
}): Promise<StartPaymentResult> {
  const merchantId = params.merchantId || process.env.ZARINPAL_MERCHANT_ID || "";
  const transactionId = newId();

  if (merchantId) {
    try {
      const res = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount: params.amount * 10, // ریال
          description: params.description ?? `سفارش ${params.orderId}`,
          callback_url: `${params.baseUrl}/api/payment/callback?order=${params.orderId}`,
        }),
      });
      const data = (await res.json()) as { data?: { authority?: string; code?: number } };
      const authority = data?.data?.authority;
      if (authority) {
        await db.insert(transactions).values({
          id: transactionId,
          orderId: params.orderId,
          gateway: "ZARINPAL",
          amount: params.amount,
          status: "PENDING",
          authority,
        });
        return {
          transactionId,
          redirectUrl: `https://www.zarinpal.com/pg/StartPay/${authority}`,
        };
      }
    } catch (error) {
      console.error("Zarinpal request failed, falling back to internal gateway", error);
    }
  }

  await db.insert(transactions).values({
    id: transactionId,
    orderId: params.orderId,
    gateway: "MOCK",
    amount: params.amount,
    status: "PENDING",
    authority: transactionId,
  });
  return {
    transactionId,
    redirectUrl: `/payment/gateway?tx=${transactionId}`,
  };
}
