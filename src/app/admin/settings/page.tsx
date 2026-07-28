import { saveSettingsAction } from "@/app/actions/admin";
import { getSettings, parseSocials } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const socials = parseSocials(settings.socials);

  return (
    <div className="space-y-4">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">تنظیمات عمومی سایت</h1>
        <p className="mt-1 text-xs text-slate-600">
          محتوای هیرو، اطلاعات پشتیبانی و نماد اعتماد الکترونیکی از این بخش مدیریت می‌شود.
        </p>
      </div>

      <form action={saveSettingsAction} className="glass card grid gap-4 p-6 md:grid-cols-2">
        <div>
          <label className="label">نام سایت</label>
          <input name="siteName" className="input" defaultValue={settings.siteName} />
        </div>
        <div>
          <label className="label">متن دکمه اصلی</label>
          <input name="heroCtaText" className="input" defaultValue={settings.heroCtaText} />
        </div>
        <div className="md:col-span-2">
          <label className="label">تیتر هیرو</label>
          <input name="heroTitle" className="input" defaultValue={settings.heroTitle} />
        </div>
        <div className="md:col-span-2">
          <label className="label">زیرتیتر هیرو</label>
          <textarea name="heroSubtitle" className="input min-h-20" defaultValue={settings.heroSubtitle} />
        </div>
        <div>
          <label className="label">لینک دکمه اصلی</label>
          <input name="heroCtaLink" className="input" defaultValue={settings.heroCtaLink} />
        </div>
        <div>
          <label className="label">آیدی تلگرام پشتیبانی</label>
          <input name="telegramId" className="input" defaultValue={settings.telegramId} placeholder="zenoxweb" />
        </div>
        <div>
          <label className="label">شماره واتساپ (با کد کشور)</label>
          <input name="whatsappNumber" className="input" defaultValue={settings.whatsappNumber} placeholder="989120000000" />
        </div>
        <div>
          <label className="label">ایمیل پشتیبانی</label>
          <input name="supportEmail" className="input" defaultValue={settings.supportEmail} />
        </div>
        <div>
          <label className="label">تلفن پشتیبانی</label>
          <input name="supportPhone" className="input" defaultValue={settings.supportPhone} />
        </div>
        <div>
          <label className="label">آدرس</label>
          <input name="address" className="input" defaultValue={settings.address} />
        </div>
        <div>
          <label className="label">تصویر نماد اعتماد (URL)</label>
          <input name="enamadImage" className="input" defaultValue={settings.enamadImage} />
        </div>
        <div>
          <label className="label">لینک نماد اعتماد</label>
          <input name="enamadLink" className="input" defaultValue={settings.enamadLink} />
        </div>
        <div className="md:col-span-2">
          <label className="label">شبکه‌های اجتماعی (هر خط: عنوان|لینک)</label>
          <textarea
            name="socials"
            className="input min-h-24"
            defaultValue={socials.map((s) => `${s.label}|${s.url}`).join("\n")}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">الگوی ایمیل تیکت‌های پشتیبانی</label>
          <textarea
            name="supportEmailTemplate"
            className="input min-h-32 text-xs font-mono"
            defaultValue={settings.supportEmailTemplate}
            placeholder={`سلام {customer_name}
تیکت شماره {ticket_id} با موضوع "{subject}" ثبت شده است.
...`}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            متغیرها: {"{customer_name}, {ticket_id}, {subject}, {message}, {support_phone}, {support_email}"}
          </p>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-primary">
            ذخیره تنظیمات
          </button>
        </div>
      </form>
    </div>
  );
}
