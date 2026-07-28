# تاریخچه تغییرات ZeNOxWeb.ir

## نسخه ۱.۱.۰ — سیستم تیکت‌های پشتیبانی و ایمیل

### اضافات جدید

#### 🎧 سیستم تیکت‌های پشتیبانی
- **جداول جدید:**
  - `support_tickets`: ذخیره تیکت‌های پشتیبانی
  - `ticket_replies`: ذخیره پاسخ‌های تیکت
  - `site_settings.support_email_template`: الگوی ایمیل تیکت

- **صفحات مشتری:**
  - `/account/tickets`: لیست تمام تیکت‌های مشتری
  - `/account/tickets/new`: ایجاد تیکت جدید
  - `/account/tickets/[id]`: مشاهده جزئیات تیکت و پاسخ‌دهی

- **صفحات ادمین:**
  - `/admin/support`: مدیریت تمام تیکت‌های پشتیبانی
  - فیلتر بر اساس وضعیت و اولویت
  - مشاهده و پاسخ‌دهی مستقیم

#### 📧 سیستم ایمیل خودکار
- **ماژول ایمیل:** `src/lib/email.ts`
  - ارسال ایمیل از طریق Resend
  - قالب HTML حرفه‌ای برای ایمیل‌ها
  - خودکار در محیط توسعه (لاگ)

- **ایمیل‌های پیاده‌شده:**
  - تایید ثبت تیکت (الگوی قابل‌تخصیص)
  - اطلاع‌رسانی پاسخ تیم به مشتری

#### ⚙️ Server Actions
- `createTicketAction`: ایجاد تیکت جدید
- `replyTicketAction`: پاسخ‌دهی به تیکت
- `updateTicketStatusAction`: تغییر وضعیت تیکت

#### 📊 بهبودی‌های پنل ادمین
- اضافه شدن "پشتیبانی" به ناوبار پنل ادمین
- اضافه شدن فیلد "الگوی ایمیل تیکت" در تنظیمات سایت

#### 🔧 بهبودی‌های فنی
- اصلاح مشکل race condition در `ensureSeed()`
- بهبود `getSettings()` برای مقاومت در برابر کوئری‌های همزمان
- اضافه شدن `onConflictDoNothing()` به تمام seed insert‌ها

### تغییرات فایل‌های موجود

#### `src/db/schema.ts`
- اضافه شدن `supportTickets` جدول
- اضافه شدن `ticketReplies` جدول
- اضافه شدن `supportEmailTemplate` به `siteSettings`

#### `src/lib/settings.ts`
- بهبود `getSettings()` برای مقاومت در برابر concurrent requests
- اضافه شدن error handling

#### `src/app/admin/layout.tsx`
- اضافه شدن لینک "پشتیبانی" به ناوبار

#### `src/app/(site)/account/page.tsx`
- اضافه شدن لینک "پشتیبانی" در پنل کاربری

#### `src/app/admin/settings/page.tsx`
- اضافه شدن فیلد "الگوی ایمیل تیکت" در فرم تنظیمات

#### `src/app/actions/admin.ts`
- اضافه شدن `supportEmailTemplate` به `saveSettingsAction()`

### فایل‌های جدید ایجادشده

```
src/lib/email.ts                          ← سیستم ایمیل
src/lib/support.ts                        ← منطق تیکت‌های پشتیبانی
src/app/actions/support.ts                ← Server Actions برای تیکت‌ها
src/app/(site)/account/tickets/page.tsx   ← لیست تیکت‌های مشتری
src/app/(site)/account/tickets/new/page.tsx ← ایجاد تیکت جدید
src/app/(site)/account/tickets/[id]/page.tsx ← جزئیات تیکت
src/app/(site)/account/tickets/[id]/TicketReplyForm.tsx ← فرم پاسخ‌دهی
src/app/admin/support/page.tsx            ← مدیریت تیکت‌های ادمین
FEATURES.fa.md                            ← راهنمای کامل فارسی
CHANGELOG.md                              ← این فایل
```

### اصلاح‌های باگ

1. **مشکل دیتابیس اولیه‌سازی:**
   - `getSettings()` دیگر منتظر نمی‌ماند تا جداول ایجاد شوند
   - استفاده از `onConflictDoNothing()` برای اطمینان از idempotency

2. **Race condition در seed:**
   - استفاده از `seedPromise` برای جلوگیری از seed چندبار
   - بهبود error handling

### نمودار فلو تیکت‌های پشتیبانی

```
مشتری ایجاد تیکت
    ↓ (ایمیل تایید خودکار)
تیم ادمین مشاهده تیکت در `/admin/support`
    ↓
تیم پاسخ می‌دهد
    ↓ (ایمیل خودکار برای مشتری)
مشتری دریافت ایمیل
    ↓
مشتری می‌تواند پاسخ دهد یا تیکت را ببندد
    ↓
تیم می‌تواند تیکت را "بسته شده" علامت‌گذاری کند
```

### متغیرهای الگوی ایمیل

```
{customer_name}     - نام مشتری
{ticket_id}         - شناسه تیکت
{subject}           - موضوع تیکت
{message}           - متن تیکت
{support_phone}     - شماره پشتیبانی
{support_email}     - ایمیل پشتیبانی
```

### حساب‌های پیش‌فرض (بدون تغییر)

```
مالک:     owner@zenoxweb.ir / owner1234
ادمین:    admin@zenoxweb.ir / admin1234
مشتری:    customer@example.com / customer1234
```

### نسخه‌های وابستگی

```
Next.js: 16.2.6
React: 19.2.6
TypeScript: 5.9.3
Drizzle ORM: 0.45.2
Tailwind CSS: 4.1.17
PostgreSQL: 16+
```

### نکات اضافی

- ✅ تمام کدها TypeScript‌شده و بدون خطا
- ✅ تمام فرم‌ها Server Action‌محور
- ✅ تمام ایمیل‌ها HTML و دیزاین‌شده
- ✅ تمام صفحات `force-dynamic` برای اطمینان از داده‌های تازه
- ✅ تمام ایمیل‌ها در development mode لاگ می‌شوند

---

## نسخه ۱.۰.۰ — انتشار اولیه

### ویژگی‌های اولیه

#### 🌐 صفحات عمومی
- صفحه‌ی اصلی دیتابیس‌محور
- فروشگاه با چیدمان دسته‌بندی
- وبلاگ سئوشده
- صفحات قالب
- سبد خرید

#### 🔐 احراز هویت
- ثبت‌نام و ورود
- احراز هویت دو‌مرحله‌ای (OTP موبایل + ایمیل)
- JWT Session

#### 🛒 فرآیند سفارش
- سفارش دو‌مرحله‌ای
- پیش‌فاکتور تاییدی
- درگاه پرداخت

#### 🎛️ پنل ادمین
- ۱۰+ ماژول مدیریت
- داشبورد با آمار

#### 🗄️ دیتابیس
- ۱۰ جدول اولیه
- Drizzle ORM

#### 🚀 دیپلوی
- Docker + Docker Compose
- Nginx Reverse Proxy
- مستندسازی کامل
