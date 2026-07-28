import { getCurrentUser } from "@/lib/auth";
import { getActivePlans } from "@/lib/queries";
import CartView from "./CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [user, plans] = await Promise.all([getCurrentUser(), getActivePlans()]);
  const authState = !user ? "GUEST" : user.phoneVerified && user.emailVerified ? "READY" : "UNVERIFIED";

  return (
    <div className="space-y-6">
      <header className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">سبد خرید و ثبت درخواست</h1>
        <p className="mt-2 text-xs leading-6 text-slate-600">
          برای هر قالب، پلن سرور و توضیحات سفارشی‌سازی را مشخص کنید.
        </p>
      </header>

      <CartView
        authState={authState}
        plans={plans.map((p) => ({
          id: p.id,
          name: p.name,
          monthlyCost: p.monthlyCost,
          description: p.description,
        }))}
      />
    </div>
  );
}
