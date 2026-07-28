import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  blogPosts,
  categories,
  hostingPlans,
  templateCategories,
  templates,
  users,
} from "@/db/schema";
import { hashPassword, newId } from "./auth";
import { getSettings } from "./settings";
import { ensureSchema } from "./migrate";

let seeded = false;
let seedPromise: Promise<void> | null = null;

const gradients = [
  "linear-gradient(135deg,#c7d2fe,#a5f3fc)",
  "linear-gradient(135deg,#fbcfe8,#ddd6fe)",
  "linear-gradient(135deg,#bbf7d0,#bfdbfe)",
];

export async function ensureSeed(): Promise<void> {
  if (seeded) return;
  if (!seedPromise) seedPromise = runSeed();
  await seedPromise;
}

async function runSeed(): Promise<void> {
  try {
    // ابتدا ساختار دیتابیس را تضمین می‌کنیم تا روی هر سرور جدید بدون خطا اجرا شود
    await ensureSchema();
    await getSettings();

    // فقط یک حساب مالک اولیه بر اساس متغیرهای محیطی ساخته می‌شود.
    // در پروداکشن OWNER_EMAIL / OWNER_PASSWORD / OWNER_PHONE را در .env تنظیم کنید
    // و بلافاصله پس از اولین ورود، رمز عبور را تغییر دهید.
    const ownerEmail = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
    const ownerPassword = process.env.OWNER_PASSWORD ?? "";
    const ownerPhone = (process.env.OWNER_PHONE ?? "").trim();
    const ownerName = (process.env.OWNER_NAME ?? "مدیر ZeNOxWeb").trim();

    if (ownerEmail && ownerPassword && ownerPhone) {
      const existingOwner = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, ownerEmail))
        .limit(1);
      if (existingOwner.length === 0) {
        await db
          .insert(users)
          .values({
            id: newId(),
            name: ownerName,
            phone: ownerPhone,
            email: ownerEmail,
            role: "OWNER",
            phoneVerified: true,
            emailVerified: true,
            passwordHash: hashPassword(ownerPassword),
          })
          .onConflictDoNothing();
      }
    } else {
      // اگر متغیرهای محیطی مالک تنظیم نشده باشند و هیچ کاربری وجود نداشته باشد،
      // یک حساب مالک پیش‌فرض ساخته می‌شود تا از قفل‌شدن پنل جلوگیری شود.
      // ⚠️ حتماً پس از اولین ورود رمز عبور را تغییر دهید و ایمیل را در .env تنظیم کنید.
      const anyUser = await db.select({ id: users.id }).from(users).limit(1);
      if (anyUser.length === 0) {
        console.warn(
          "[ZeNOxWeb] هیچ حساب مالکی تعریف نشده است. حساب مالک پیش‌فرض ساخته شد: admin@zenoxweb.ir / Owner@12345 — لطفاً بلافاصله در .env متغیرهای OWNER_* را تنظیم و رمز را تغییر دهید.",
        );
        await db
          .insert(users)
          .values({
            id: newId(),
            name: "مدیر ZeNOxWeb",
            phone: "09120000000",
            email: "admin@zenoxweb.ir",
            role: "OWNER",
            phoneVerified: true,
            emailVerified: true,
            passwordHash: hashPassword("Owner@12345"),
          })
          .onConflictDoNothing();
      }
    }

    const existingPlans = await db.select({ id: hostingPlans.id }).from(hostingPlans).limit(1);
    if (existingPlans.length === 0) {
      await db.insert(hostingPlans).values([
        {
          id: newId(),
          name: "پلن معمولی",
          tier: "BASIC",
          monthlyCost: 250000,
          description: "۱ هسته CPU، ۱ گیگ رم، مناسب سایت‌های رزومه‌ای و لندینگ",
          capacity: 40,
          usedCapacity: 12,
          sortOrder: 1,
        },
        {
          id: newId(),
          name: "پلن پرو",
          tier: "PRO",
          monthlyCost: 550000,
          description: "۲ هسته CPU، ۴ گیگ رم، بکاپ روزانه، مناسب فروشگاه‌های متوسط",
          capacity: 25,
          usedCapacity: 8,
          sortOrder: 2,
        },
        {
          id: newId(),
          name: "پلن الماس",
          tier: "DIAMOND",
          monthlyCost: 1200000,
          description: "۴ هسته CPU، ۸ گیگ رم، CDN و مانیتورینگ اختصاصی",
          capacity: 10,
          usedCapacity: 3,
          sortOrder: 3,
        },
      ]).onConflictDoNothing();
    }

    const existingCats = await db.select({ id: categories.id }).from(categories).limit(1);
    if (existingCats.length === 0) {
      const catRows = [
        { id: newId(), name: "سایت‌های محبوب", slug: "popular", sortOrder: 1, description: "منتخب تیم ZeNOxWeb" },
        { id: newId(), name: "فروشگاهی حرفه‌ای", slug: "shop", sortOrder: 2, description: "فروشگاه‌های آنلاین با درگاه پرداخت" },
        { id: newId(), name: "رزومه‌ای", slug: "resume", sortOrder: 3, description: "رزومه و پورتفولیوی شخصی" },
        { id: newId(), name: "شرکتی", slug: "corporate", sortOrder: 4, description: "سایت‌های شرکتی و سازمانی" },
      ];
      await db.insert(categories).values(catRows).onConflictDoNothing();

      const templateRows = [
        {
          id: newId(),
          title: "فروشگاه مینیمال نئون",
          slug: "neon-shop",
          description:
            "قالب فروشگاهی سریع با سبد خرید، درگاه پرداخت، مدیریت محصول و پنل ادمین اختصاصی. مناسب برندهای پوشاک و دیجیتال.",
          basePrice: 9800000,
          demoUrl: "https://demo.zenoxweb.ir/neon-shop",
          coverImage: gradients[0],
          features: ["سبد خرید و پرداخت آنلاین", "مدیریت محصول و موجودی", "کد تخفیف", "گزارش فروش"],
          techStack: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
          isFeatured: true,
          cats: ["popular", "shop"],
        },
        {
          id: newId(),
          title: "رزومه شیشه‌ای مدرن",
          slug: "glass-resume",
          description:
            "قالب رزومه تک‌صفحه‌ای با انیمیشن نرم، بخش مهارت‌ها، تجربه‌ها و فرم تماس. آماده‌ی سئو و اشتراک‌گذاری.",
          basePrice: 3500000,
          demoUrl: "https://demo.zenoxweb.ir/glass-resume",
          coverImage: gradients[1],
          features: ["تک‌صفحه‌ای واکنش‌گرا", "فرم تماس", "دانلود رزومه PDF", "چندزبانه"],
          techStack: ["Next.js", "Tailwind", "Framer Motion"],
          isFeatured: true,
          cats: ["popular", "resume"],
        },
        {
          id: newId(),
          title: "شرکتی آبی اقیانوس",
          slug: "ocean-corporate",
          description:
            "قالب شرکتی با صفحات خدمات، تیم، مشتریان و وبلاگ. مناسب شرکت‌های خدماتی و استارتاپ‌ها.",
          basePrice: 6400000,
          demoUrl: "https://demo.zenoxweb.ir/ocean-corporate",
          coverImage: gradients[2],
          features: ["صفحات خدمات", "وبلاگ سئوشده", "فرم درخواست مشاوره", "چندکاربره"],
          techStack: ["Next.js", "TypeScript", "Tailwind"],
          isFeatured: true,
          cats: ["corporate", "popular"],
        },
        {
          id: newId(),
          title: "سوپرمارکت آنلاین",
          slug: "market-plus",
          description: "فروشگاه بزرگ با دسته‌بندی چندسطحی، جستجوی سریع و مدیریت انبار.",
          basePrice: 14500000,
          demoUrl: "https://demo.zenoxweb.ir/market-plus",
          coverImage: gradients[0],
          features: ["دسته‌بندی چندسطحی", "مدیریت انبار", "ارسال و پیک", "اپلیکیشن PWA"],
          techStack: ["Next.js", "PostgreSQL", "Redis"],
          isFeatured: false,
          cats: ["shop"],
        },
        {
          id: newId(),
          title: "پورتفولیو عکاس",
          slug: "photo-portfolio",
          description: "نمایش گالری تصاویر با چیدمان مازاییک و بارگذاری تنبل برای سرعت بالا.",
          basePrice: 4200000,
          demoUrl: "https://demo.zenoxweb.ir/photo-portfolio",
          coverImage: gradients[1],
          features: ["گالری مازاییک", "لایت‌باکس", "سئوی تصاویر"],
          techStack: ["Next.js", "Tailwind"],
          isFeatured: false,
          cats: ["resume"],
        },
      ];

      for (const t of templateRows) {
        await db.insert(templates).values({
          id: t.id,
          title: t.title,
          slug: t.slug,
          description: t.description,
          basePrice: t.basePrice,
          demoUrl: t.demoUrl,
          coverImage: t.coverImage,
          images: [],
          features: t.features,
          techStack: t.techStack,
          isFeatured: t.isFeatured,
        });
        for (const slug of t.cats) {
          const cat = catRows.find((c) => c.slug === slug);
          if (cat) {
            await db
              .insert(templateCategories)
              .values({ templateId: t.id, categoryId: cat.id })
              .onConflictDoNothing();
          }
        }
      }
    }

    const existingPosts = await db.select({ id: blogPosts.id }).from(blogPosts).limit(1);
    if (existingPosts.length === 0) {
      await db.insert(blogPosts).values([
        {
          id: newId(),
          title: "سایت ساز یا طراحی اختصاصی؟ راهنمای انتخاب در ۱۴۰۴",
          slug: "site-builder-vs-custom",
          excerpt:
            "مقایسه‌ی کامل سایت‌سازهای آماده با طراحی سایت حرفه‌ای اختصاصی از نگاه هزینه، سئو و سرعت.",
          content:
            "سایت ساز ابزاری سریع برای شروع است، اما وقتی کسب‌وکار رشد می‌کند محدودیت‌های آن آشکار می‌شود.\n\nدر ZeNOxWeb قالب‌های آماده را با کد اختصاصی Next.js می‌سازیم؛ یعنی سرعت راه‌اندازی سایت‌ساز را دارید و در عین حال مالک کد و دیتابیس خودتان هستید.\n\nمزایای طراحی اختصاصی:\n- سرعت لود بالاتر و امتیاز بهتر Core Web Vitals\n- کنترل کامل روی ساختار سئو\n- امکان توسعه‌ی نامحدود پنل مدیریت",
          seoTitle: "سایت ساز یا طراحی سایت حرفه‌ای؟ | ZeNOxWeb",
          metaDescription:
            "راهنمای انتخاب بین سایت ساز آماده و طراحی سایت حرفه‌ای با Next.js؛ مقایسه هزینه، سئو و سرعت.",
          keywords: ["سایت ساز", "طراحی سایت حرفه ای", "طراح سایت Next.js"],
          isPublished: true,
          publishedAt: new Date(),
        },
        {
          id: newId(),
          title: "چطور یک سایت فروشگاهی پرفروش بسازیم؟",
          slug: "build-ecommerce-site",
          excerpt: "از انتخاب قالب تا درگاه پرداخت و سئوی محصول؛ چک‌لیست ساخت سایت فروشگاهی.",
          content:
            "ساخت سایت فروشگاهی فقط نمایش محصول نیست؛ مسیر خرید باید کوتاه و قابل اعتماد باشد.\n\nچک‌لیست ما:\n1. ساختار دسته‌بندی شفاف\n2. صفحه محصول با تصویر باکیفیت و توضیح سئوشده\n3. درگاه پرداخت مطمئن (زرین‌پال)\n4. نماد اعتماد الکترونیکی\n5. سرعت لود زیر ۲ ثانیه",
          seoTitle: "ساخت سایت فروشگاهی حرفه‌ای | ZeNOxWeb",
          metaDescription: "چک‌لیست کامل ساخت سایت فروشگاهی سریع، امن و سئوشده با Next.js.",
          keywords: ["ساخت سایت فروشگاهی", "طراحی سایت حرفه ای"],
          isPublished: true,
          publishedAt: new Date(),
        },
        {
          id: newId(),
          title: "ساخت سایت رزومه که استخدامت کند",
          slug: "resume-website-guide",
          excerpt: "نکات کاربردی برای ساخت سایت رزومه‌ای که کارفرما را در ۱۰ ثانیه قانع می‌کند.",
          content:
            "سایت رزومه ویترین حرفه‌ای شماست. تیتر شفاف، نمونه‌کار واقعی و راه ارتباطی ساده مهم‌ترین اجزا هستند.\n\nپیشنهاد ما استفاده از قالب رزومه شیشه‌ای ZeNOxWeb است که برای سئو و سرعت بهینه شده است.",
          seoTitle: "ساخت سایت رزومه حرفه‌ای | ZeNOxWeb",
          metaDescription: "راهنمای ساخت سایت رزومه شخصی حرفه‌ای و سئوشده با Next.js.",
          keywords: ["ساخت سایت رزومه", "سایت ساز"],
          isPublished: true,
          publishedAt: new Date(),
        },
      ]).onConflictDoNothing();
    }

    // مقداردهی اولیه‌ی آمار بازدید برای داشبورد
    await db.execute(sql`SELECT 1`);
    seeded = true;
  } catch (error) {
    console.error("seed failed", error);
    seedPromise = null;
  }
}
