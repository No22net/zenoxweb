import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("CUSTOMER"), // OWNER | ADMIN | CUSTOMER
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  channel: text("channel").notNull(), // PHONE | EMAIL
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  basePrice: integer("base_price").notNull().default(0),
  demoUrl: text("demo_url").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  features: text("features").array().notNull().default(sql`ARRAY[]::text[]`),
  techStack: text("tech_stack").array().notNull().default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const templateCategories = pgTable(
  "template_categories",
  {
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.templateId, t.categoryId] })],
);

export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  seoTitle: text("seo_title").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  keywords: text("keywords").array().notNull().default(sql`ARRAY[]::text[]`),
  authorName: text("author_name").notNull().default("مدیرعامل ZeNOxWeb"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hostingPlans = pgTable("hosting_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier").notNull().default("BASIC"),
  monthlyCost: integer("monthly_cost").notNull().default(0),
  description: text("description").notNull().default(""),
  capacity: integer("capacity").notNull().default(20),
  usedCapacity: integer("used_capacity").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  templateId: text("template_id")
    .notNull()
    .references(() => templates.id),
  hostingPlanId: text("hosting_plan_id")
    .notNull()
    .references(() => hostingPlans.id),
  customizationNotes: text("customization_notes").notNull().default(""),
  quotedDesignPrice: integer("quoted_design_price"),
  hostingPrice: integer("hosting_price").notNull().default(0),
  adminNote: text("admin_note"),
  totalPrice: integer("total_price"),
  status: text("status").notNull().default("AWAITING_QUOTE"),
  domain: text("domain"),
  serverInfo: text("server_info"),
  paymentRefId: text("payment_ref_id"),
  quotedAt: timestamp("quoted_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  gateway: text("gateway").notNull().default("MOCK"),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("PENDING"), // PENDING | SUCCESS | FAILED
  refId: text("ref_id"),
  authority: text("authority"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteVisits = pgTable("site_visits", {
  id: text("id").primaryKey(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey(),
  siteName: text("site_name").notNull().default("ZeNOxWeb"),
  heroTitle: text("hero_title").notNull().default(""),
  heroSubtitle: text("hero_subtitle").notNull().default(""),
  heroCtaText: text("hero_cta_text").notNull().default("ساخت سایت شخصی خودتون"),
  heroCtaLink: text("hero_cta_link").notNull().default("/shop"),
  enamadImage: text("enamad_image").notNull().default(""),
  enamadLink: text("enamad_link").notNull().default(""),
  telegramId: text("telegram_id").notNull().default(""),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  supportEmail: text("support_email").notNull().default(""),
  supportPhone: text("support_phone").notNull().default(""),
  address: text("address").notNull().default(""),
  socials: jsonb("socials").notNull().default(sql`'[]'::jsonb`),
  homepageBlocks: jsonb("homepage_blocks").notNull().default(sql`'[]'::jsonb`),
  gatewayName: text("gateway_name").notNull().default("MOCK"),
  gatewayMerchantId: text("gateway_merchant_id").notNull().default(""),
  gatewayEnabled: boolean("gateway_enabled").notNull().default(true),
  supportEmailTemplate: text("support_email_template").notNull().default(
    `سلام {customer_name}

تیکت شماره {ticket_id} با موضوع "{subject}" ثبت شده است.

پیام شما:
{message}

ما در اسرع وقت به شما پاسخ خواهیم داد.

—
تیم پشتیبانی ZeNOxWeb
{support_phone} | {support_email}`,
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("OPEN"), // OPEN | ANSWERED | CLOSED
  priority: text("priority").notNull().default("NORMAL"), // LOW | NORMAL | HIGH | URGENT
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ticketReplies = pgTable("ticket_replies", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => supportTickets.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isStaff: boolean("is_staff").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
