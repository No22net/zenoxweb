export function toman(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("en-US").format(value)} تومان`;
}

export function num(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

export function faDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  AWAITING_QUOTE: "در انتظار پیش‌فاکتور",
  QUOTED: "پیش‌فاکتور صادر شد",
  APPROVED_BY_CUSTOMER: "تایید مشتری - در انتظار پرداخت",
  PAID: "پرداخت شد",
  IN_PROGRESS: "در حال اجرا",
  DEPLOYED: "دیپلوی شد",
  DELIVERED: "تحویل داده شد",
  CANCELLED: "لغو شده",
};

export const ORDER_STATUS_FLOW = [
  "AWAITING_QUOTE",
  "QUOTED",
  "APPROVED_BY_CUSTOMER",
  "PAID",
  "IN_PROGRESS",
  "DEPLOYED",
  "DELIVERED",
];

export function statusColor(status: string): string {
  switch (status) {
    case "AWAITING_QUOTE":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "QUOTED":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "APPROVED_BY_CUSTOMER":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "PAID":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "IN_PROGRESS":
      return "bg-violet-100 text-violet-800 border-violet-200";
    case "DEPLOYED":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "DELIVERED":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
