import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { ensureSchema } from "./migrate";

export type HomeBlockItem = { title: string; text: string; icon?: string };

export type HomeBlock = {
  id: string;
  type: "steps" | "featured" | "stats" | "richtext";
  title: string;
  subtitle: string;
  visible: boolean;
  order: number;
  items: HomeBlockItem[];
};

export type SocialLink = { label: string; url: string };

export type Settings = typeof siteSettings.$inferSelect;

export const SETTINGS_ID = "main";

export const DEFAULT_BLOCKS: HomeBlock[] = [
  {
    id: "steps",
    type: "steps",
    title: "چطور کار می‌کنیم؟",
    subtitle: "از انتخاب قالب تا تحویل سایت، تنها در پنج قدم ساده",
    visible: true,
    order: 1,
    items: [
      { title: "انتخاب قالب", text: "از میان ده‌ها نمونه‌کار آماده، نزدیک‌ترین طرح به کسب‌وکارت را انتخاب کن.", icon: "🎯" },
      { title: "ثبت درخواست", text: "سفارشی‌سازی‌های مورد نظر و پلن سرور را مشخص کن.", icon: "📝" },
      { title: "دریافت قیمت", text: "کارشناس ما پیش‌فاکتور دقیق طراحی + سرور را برایت صادر می‌کند.", icon: "🧾" },
      { title: "پرداخت امن", text: "پس از تایید پیش‌فاکتور، پرداخت یکجا از طریق درگاه بانکی.", icon: "💳" },
      { title: "تحویل سایت", text: "دیپلوی روی سرور، اتصال دامنه و تحویل نهایی همراه آموزش.", icon: "🚀" },
    ],
  },
  {
    id: "featured",
    type: "featured",
    title: "نمونه‌کارهای برتر",
    subtitle: "طرح‌هایی که بیشترین سفارش را داشته‌اند",
    visible: true,
    order: 2,
    items: [],
  },
  {
    id: "stats",
    type: "stats",
    title: "چرا ZeNOxWeb؟",
    subtitle: "اعداد پروژه‌هایی که تا امروز تحویل داده‌ایم",
    visible: true,
    order: 3,
    items: [
      { title: "۱۲۰+", text: "سایت تحویل‌داده‌شده", icon: "🌐" },
      { title: "۹۸٪", text: "رضایت مشتریان", icon: "⭐" },
      { title: "۷ روز", text: "میانگین زمان تحویل", icon: "⚡" },
      { title: "۲۴/۷", text: "پشتیبانی فنی", icon: "🛟" },
    ],
  },
  {
    id: "why",
    type: "richtext",
    title: "تکنولوژی روز، سرعت بالا، سئوی حرفه‌ای",
    subtitle:
      "تمام سایت‌های ZeNOxWeb با Next.js و TypeScript ساخته می‌شوند؛ یعنی سرعت لود بالا، امنیت بیشتر و رتبه بهتر در گوگل.",
    visible: true,
    order: 4,
    items: [
      { title: "سئوی تکنیکال", text: "ساختار متادیتا، سرعت و اسکیمای استاندارد برای رتبه بهتر.", icon: "📈" },
      { title: "پنل مدیریت اختصاصی", text: "محتوای سایت را بدون دانش فنی خودت مدیریت کن.", icon: "🛠" },
      { title: "میزبانی مطمئن", text: "سرورهای ابری با آپ‌تایم بالا و بکاپ روزانه.", icon: "☁️" },
    ],
  },
];

export async function getSettings(): Promise<Settings> {
  // تضمین می‌کنیم ساختار دیتابیس به‌روز است تا کوئری روی سرور با ستون‌های جدید شکست نخورد
  await ensureSchema();

  try {
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, SETTINGS_ID)).limit(1);
    if (rows[0]) return rows[0];
  } catch {
    // table might not exist yet during seeding
  }

  try {
    await db
      .insert(siteSettings)
      .values({
        id: SETTINGS_ID,
        heroTitle: "سایت حرفه‌ای کسب‌وکارت را آماده تحویل بگیر",
        heroSubtitle:
          "ZeNOxWeb قالب‌های آماده و شخصی‌سازی‌شده با Next.js طراحی می‌کند؛ فروشگاهی، رزومه‌ای یا شرکتی — همراه با میزبانی، دامنه و پشتیبانی.",
        telegramId: "zenoxweb",
        whatsappNumber: "989120000000",
        supportEmail: "support@zenoxweb.ir",
        supportPhone: "021-91000000",
        address: "تهران، ایران",
        socials: [
          { label: "اینستاگرام", url: "https://instagram.com/zenoxweb" },
          { label: "لینکدین", url: "https://linkedin.com/company/zenoxweb" },
        ],
        homepageBlocks: DEFAULT_BLOCKS,
      })
      .onConflictDoNothing();
  } catch {
    // ignore
  }

  const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, SETTINGS_ID)).limit(1);
  return rows[0]!;
}

export function parseBlocks(value: unknown): HomeBlock[] {
  if (!Array.isArray(value)) return DEFAULT_BLOCKS;
  return (value as HomeBlock[]).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function parseSocials(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value as SocialLink[];
}
