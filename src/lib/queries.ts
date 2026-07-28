import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, categories, hostingPlans, templateCategories, templates } from "@/db/schema";

export type TemplateRow = typeof templates.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;

export async function getActiveCategories(): Promise<CategoryRow[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getActiveTemplates(): Promise<TemplateRow[]> {
  return db
    .select()
    .from(templates)
    .where(eq(templates.isActive, true))
    .orderBy(desc(templates.isFeatured), desc(templates.createdAt));
}

export async function getFeaturedTemplates(limit = 3): Promise<TemplateRow[]> {
  const rows = await db
    .select()
    .from(templates)
    .where(and(eq(templates.isActive, true), eq(templates.isFeatured, true)))
    .orderBy(desc(templates.createdAt))
    .limit(limit);
  if (rows.length > 0) return rows;
  return db.select().from(templates).where(eq(templates.isActive, true)).limit(limit);
}

export async function getTemplateCategoryMap(
  templateIds: string[],
): Promise<Record<string, string[]>> {
  if (templateIds.length === 0) return {};
  const rows = await db
    .select()
    .from(templateCategories)
    .where(inArray(templateCategories.templateId, templateIds));
  const map: Record<string, string[]> = {};
  for (const row of rows) {
    map[row.templateId] = [...(map[row.templateId] ?? []), row.categoryId];
  }
  return map;
}

export async function getTemplateBySlug(slug: string): Promise<TemplateRow | null> {
  const rows = await db.select().from(templates).where(eq(templates.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getActivePlans() {
  return db
    .select()
    .from(hostingPlans)
    .where(eq(hostingPlans.isActive, true))
    .orderBy(asc(hostingPlans.sortOrder), asc(hostingPlans.monthlyCost));
}

export async function getPublishedPosts() {
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));
}

export async function getPostBySlug(slug: string) {
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return rows[0] ?? null;
}
