import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { orders, transactions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { toman } from "@/lib/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ tx?: string }>;

async function completePayment(formData: FormData) {
  "use server";
  const txId = String(formData.get("tx") ?? "");
  const result = String(formData.get("result") ?? "FAILED");

  const rows = await db.select().from(transactions).where(eq(transactions.id, txId)).limit(1);
  const tx = rows[0];
  if (!tx) redirect("/account");

  if (result === "SUCCESS") {
    const refId = `ZW${Date.now().toString().slice(-10)}`;
    await db.update(transactions).set({ status: "SUCCESS", refId }).where(eq(transactions.id, txId));
    await db
      .update(orders)
      .set({ status: "PAID", paidAt: new Date(), paymentRefId: refId, updatedAt: new Date() })
      .where(eq(orders.id, tx.orderId));
  } else {
    await db.update(transactions).set({ status: "FAILED" }).where(eq(transactions.id, txId));
  }
  redirect(`/account/orders/${tx.orderId}`);
}

export default async function GatewayPage({ searchParams }: { searchParams: SearchParams }) {
  const { tx } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!tx) notFound();

  const rows = await db.select().from(transactions).where(eq(transactions.id, tx)).limit(1);
  const transaction = rows[0];
  if (!transaction) notFound();

  return (
    <div className="mx-auto max-w-md">
      <div className="glass card space-y-5 p-8 text-center">
        <h1 className="text-lg font-black text-slate-900">درگاه پرداخت (حالت آزمایشی)</h1>
        <p className="text-xs leading-6 text-slate-600">
          درگاه واقعی زرین‌پال با تنظیم Merchant ID در پنل مالک فعال می‌شود. در این حالت می‌توانید
          فرآیند پرداخت را شبیه‌سازی کنید.
        </p>
        <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-slate-800">
          مبلغ قابل پرداخت: {toman(transaction.amount)}
        </div>

        <div className="flex gap-2">
          <form action={completePayment} className="flex-1">
            <input type="hidden" name="tx" value={transaction.id} />
            <input type="hidden" name="result" value="SUCCESS" />
            <button type="submit" className="btn btn-primary w-full">
              پرداخت موفق
            </button>
          </form>
          <form action={completePayment} className="flex-1">
            <input type="hidden" name="tx" value={transaction.id} />
            <input type="hidden" name="result" value="FAILED" />
            <button type="submit" className="btn btn-ghost w-full">
              انصراف
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
