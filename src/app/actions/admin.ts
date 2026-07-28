"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  blogPosts,
  categories,
  hostingPlans,
  orders,
  siteSettings,
  templateCategories,
  templates,
  users,
} from "@/db/schema";
import { hashPassword, newId, requireOwner, requireStaff } from "@/lib/auth";
import { SETTINGS_ID, type HomeBlock } from "@/lib/settings";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const int = (fd: FormData, key: string) => {
  const raw = String(fd.get(key) ?? "").replace(/[^\d-]/g, "");
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};
const list = (fd: FormData, key: string) =>
  String(fd.get(key) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

function slugify(input: string, fallback: string) {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\u0600-\u06FF]/g, "");
  return s || fallback;
}

/* ---------------------------------- Templates --------------------------------- */

export async function saveTemplateAction(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return;
  const values = {
    title,
    slug: slugify(str(formData, "slug") || title, `tpl-${Date.now()}`),
    description: str(formData, "description"),
    basePrice: int(formData, "basePrice"),
    demoUrl: str(formData, "demoUrl"),
    coverImage: str(formData, "coverImage"),
    features: list(formData, "features"),
    techStack: list(formData, "techStack"),
    images: list(formData, "images"),
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  };

  const templateId = id || newId();
  if (id) {
    await db.update(templates).set(values).where(eq(templates.id, id));
    await db.delete(templateCategories).where(eq(templateCategories.templateId, id));
  } else {
    await db.insert(templates).values({ id: templateId, ...values });
  }

  const catIds = formData.getAll("categoryIds").map(String).filter(Boolean);
  for (const categoryId of catIds) {
    await db.insert(templateCategories).values({ templateId, categoryId }).onConflictDoNothing();
  }

  revalidatePath("/admin/templates");
  revalidatePath("/shop");
  redirect("/admin/templates");
}

export async function deleteTemplateAction(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  await db.delete(templates).where(eq(templates.id, id));
  revalidatePath("/admin/templates");
  revalidatePath("/shop");
}

/* --------------------------------- Categories --------------------------------- */

export async function saveCategoryAction(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) return;
  const values = {
    name,
    slug: slugify(str(formData, "slug") || name, `cat-${Date.now()}`),
    description: str(formData, "description"),
    sortOrder: int(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on",
  };
  if (id) await db.update(categories).set(values).where(eq(categories.id, id));
  else await db.insert(categories).values({ id: newId(), ...values });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireStaff();
  await db.delete(categories).where(eq(categories.id, str(formData, "id")));
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

/* ------------------------------- Hosting plans -------------------------------- */

export async function savePlanAction(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const values = {
    name: str(formData, "name"),
    tier: str(formData, "tier") || "BASIC",
    monthlyCost: int(formData, "monthlyCost"),
    description: str(formData, "description"),
    capacity: int(formData, "capacity"),
    usedCapacity: int(formData, "usedCapacity"),
    sortOrder: int(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on",
  };
  if (!values.name) return;
  if (id) await db.update(hostingPlans).set(values).where(eq(hostingPlans.id, id));
  else await db.insert(hostingPlans).values({ id: newId(), ...values });
  revalidatePath("/admin/plans");
}

export async function deletePlanAction(formData: FormData) {
  await requireStaff();
  await db
    .update(hostingPlans)
    .set({ isActive: false })
    .where(eq(hostingPlans.id, str(formData, "id")));
  revalidatePath("/admin/plans");
}

/* ----------------------------------- Orders ----------------------------------- */

export async function quoteOrderAction(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const designPrice = int(formData, "quotedDesignPrice");
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = rows[0];
  if (!order) return;

  await db
    .update(orders)
    .set({
      quotedDesignPrice: designPrice,
      adminNote: str(formData, "adminNote"),
      totalPrice: designPrice + order.hostingPrice,
      status: "QUOTED",
      quotedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const status = str(formData, "status");
  const patch: Record<string, unknown> = {
    status,
    domain: str(formData, "domain") || null,
    serverInfo: str(formData, "serverInfo") || null,
    updatedAt: new Date(),
  };
  if (status === "DELIVERED") patch.deliveredAt = new Date();
  await db.update(orders).set(patch).where(eq(orders.id, id));
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

/* ------------------------------------ Users ----------------------------------- */

export async function createStaffAction(formData: FormData) {
  await requireOwner();
  const email = str(formData, "email").toLowerCase();
  const phone = str(formData, "phone");
  const name = str(formData, "name");
  const password = str(formData, "password");
  if (!email || !phone || !name || password.length < 8) return;
  await db
    .insert(users)
    .values({
      id: newId(),
      name,
      email,
      phone,
      role: str(formData, "role") === "OWNER" ? "OWNER" : "ADMIN",
      passwordHash: hashPassword(password),
      phoneVerified: true,
      emailVerified: true,
    })
    .onConflictDoNothing();
  revalidatePath("/admin/users");
}

export async function toggleUserActiveAction(formData: FormData) {
  await requireOwner();
  const id = str(formData, "id");
  const active = str(formData, "active") === "true";
  await db.update(users).set({ isActive: active }).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  const owner = await requireOwner();
  const id = str(formData, "id");
  if (id === owner.id) return;
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

/* ---------------------------------- Settings ---------------------------------- */

export async function saveSettingsAction(formData: FormData) {
  await requireStaff();
  const socialsRaw = list(formData, "socials"); // "label|url"
  await db
    .update(siteSettings)
    .set({
      siteName: str(formData, "siteName") || "ZeNOxWeb",
      heroTitle: str(formData, "heroTitle"),
      heroSubtitle: str(formData, "heroSubtitle"),
      heroCtaText: str(formData, "heroCtaText"),
      heroCtaLink: str(formData, "heroCtaLink") || "/shop",
      telegramId: str(formData, "telegramId"),
      whatsappNumber: str(formData, "whatsappNumber"),
      enamadImage: str(formData, "enamadImage"),
      enamadLink: str(formData, "enamadLink"),
      supportEmail: str(formData, "supportEmail"),
      supportPhone: str(formData, "supportPhone"),
      address: str(formData, "address"),
      socials: socialsRaw.map((line) => {
        const [label, url] = line.split("|");
        return { label: (label ?? "").trim(), url: (url ?? "").trim() };
      }),
      supportEmailTemplate: str(formData, "supportEmailTemplate"),
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, SETTINGS_ID));
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function saveHomepageBlocksAction(formData: FormData) {
  await requireStaff();
  let blocks: HomeBlock[];
  try {
    blocks = JSON.parse(str(formData, "blocks")) as HomeBlock[];
  } catch {
    return;
  }
  await db
    .update(siteSettings)
    .set({ homepageBlocks: blocks, updatedAt: new Date() })
    .where(eq(siteSettings.id, SETTINGS_ID));
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function saveGatewayAction(formData: FormData) {
  await requireOwner();
  await db
    .update(siteSettings)
    .set({
      gatewayName: str(formData, "gatewayName") || "MOCK",
      gatewayMerchantId: str(formData, "gatewayMerchantId"),
      gatewayEnabled: formData.get("gatewayEnabled") === "on",
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, SETTINGS_ID));
  revalidatePath("/admin/payments");
}

/* ------------------------------------ Blog ------------------------------------ */

export async function savePostAction(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return;
  const published = formData.get("isPublished") === "on";
  const values = {
    title,
    slug: slugify(str(formData, "slug") || title, `post-${Date.now()}`),
    content: String(formData.get("content") ?? ""),
    excerpt: str(formData, "excerpt"),
    coverImage: str(formData, "coverImage"),
    seoTitle: str(formData, "seoTitle"),
    metaDescription: str(formData, "metaDescription"),
    keywords: str(formData, "keywords")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    authorName: str(formData, "authorName") || "مدیرعامل ZeNOxWeb",
    isPublished: published,
    publishedAt: published ? new Date() : null,
  };
  if (id) await db.update(blogPosts).set(values).where(eq(blogPosts.id, id));
  else await db.insert(blogPosts).values({ id: newId(), ...values });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deletePostAction(formData: FormData) {
  await requireStaff();
  await db.delete(blogPosts).where(eq(blogPosts.id, str(formData, "id")));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
