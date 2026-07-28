"use client";

import { useState } from "react";
import type { HomeBlock } from "@/lib/settings";
import { saveHomepageBlocksAction } from "@/app/actions/admin";

export default function BlockEditor({ initial }: { initial: HomeBlock[] }) {
  const [blocks, setBlocks] = useState<HomeBlock[]>(initial);

  const patch = (id: string, changes: Partial<HomeBlock>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...changes } : b)));

  const patchItem = (blockId: string, index: number, changes: Partial<HomeBlock["items"][number]>) =>
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, items: b.items.map((it, i) => (i === index ? { ...it, ...changes } : it)) }
          : b,
      ),
    );

  const addItem = (blockId: string) =>
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, items: [...b.items, { title: "", text: "", icon: "✨" }] } : b,
      ),
    );

  const removeItem = (blockId: string, index: number) =>
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, items: b.items.filter((_, i) => i !== index) } : b)),
    );

  const addBlock = () =>
    setBlocks((prev) => [
      ...prev,
      {
        id: `block-${Date.now()}`,
        type: "richtext",
        title: "بخش جدید",
        subtitle: "",
        visible: true,
        order: prev.length + 1,
        items: [],
      },
    ]);

  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));

  return (
    <form action={saveHomepageBlocksAction} className="space-y-4">
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />

      {blocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((block) => (
          <section key={block.id} className="glass card space-y-3 p-6">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="label">عنوان بخش</label>
                <input
                  className="input"
                  value={block.title}
                  onChange={(e) => patch(block.id, { title: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">زیرعنوان</label>
                <input
                  className="input"
                  value={block.subtitle}
                  onChange={(e) => patch(block.id, { subtitle: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 items-end gap-2">
                <div>
                  <label className="label">ترتیب</label>
                  <input
                    className="input"
                    value={block.order}
                    onChange={(e) => patch(block.id, { order: Number(e.target.value) || 0 })}
                  />
                </div>
                <label className="flex items-center gap-1 pb-2 text-xs">
                  <input
                    type="checkbox"
                    checked={block.visible}
                    onChange={(e) => patch(block.id, { visible: e.target.checked })}
                  />
                  نمایش
                </label>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="btn btn-ghost text-rose-600 !px-2 text-xs"
                >
                  حذف
                </button>
              </div>
            </div>

            <div>
              <label className="label">نوع بخش</label>
              <select
                className="input max-w-48"
                value={block.type}
                onChange={(e) => patch(block.id, { type: e.target.value as HomeBlock["type"] })}
              >
                <option value="steps">مراحل کار</option>
                <option value="featured">نمونه‌کارهای برتر</option>
                <option value="stats">آمار و اعتمادسازی</option>
                <option value="richtext">کارت‌های متنی</option>
              </select>
            </div>

            {block.type !== "featured" && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">آیتم‌ها</p>
                {block.items.map((item, i) => (
                  <div key={i} className="grid gap-2 md:grid-cols-[80px_1fr_2fr_70px]">
                    <input
                      className="input"
                      value={item.icon ?? ""}
                      onChange={(e) => patchItem(block.id, i, { icon: e.target.value })}
                      placeholder="آیکن"
                    />
                    <input
                      className="input"
                      value={item.title}
                      onChange={(e) => patchItem(block.id, i, { title: e.target.value })}
                      placeholder="عنوان"
                    />
                    <input
                      className="input"
                      value={item.text}
                      onChange={(e) => patchItem(block.id, i, { text: e.target.value })}
                      placeholder="متن"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(block.id, i)}
                      className="btn btn-ghost text-rose-600 text-xs"
                    >
                      حذف
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addItem(block.id)} className="btn btn-ghost text-xs">
                  + افزودن آیتم
                </button>
              </div>
            )}
          </section>
        ))}

      <div className="flex gap-2">
        <button type="button" onClick={addBlock} className="btn btn-ghost">
          + بخش جدید
        </button>
        <button type="submit" className="btn btn-primary">
          ذخیره صفحه اصلی
        </button>
      </div>
    </form>
  );
}
