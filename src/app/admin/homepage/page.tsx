import { getSettings, parseBlocks } from "@/lib/settings";
import BlockEditor from "./BlockEditor";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const settings = await getSettings();
  const blocks = parseBlocks(settings.homepageBlocks);

  return (
    <div className="space-y-4">
      <div className="glass card p-6">
        <h1 className="text-xl font-black text-slate-900">صفحه‌ساز صفحه اصلی</h1>
        <p className="mt-1 text-xs leading-6 text-slate-600">
          ترتیب، نمایش و محتوای هر بخش از صفحه اصلی را بدون تغییر کد ویرایش کنید.
        </p>
      </div>
      <BlockEditor initial={blocks} />
    </div>
  );
}
