import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * مهاجرت خودکار و idempotent دیتابیس.
 * این تابع در اولین درخواست اجرا می‌شود و تمام جداول و ستون‌های مورد نیاز را
 * در صورت نبود ایجاد می‌کند؛ بنابراین روی هر سرور جدید یا دیتابیس قدیمی،
 * ساختار همیشه با کد هماهنگ می‌ماند و نیازی به اجرای دستی drizzle-kit push نیست.
 */

let migrated = false;
let migratePromise: Promise<void> | null = null;

export async function ensureSchema(): Promise<void> {
  if (migrated) return;
  if (!migratePromise) migratePromise = runMigration();
  await migratePromise;
}

async function runMigration(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "phone" text NOT NULL UNIQUE,
        "phone_verified" boolean NOT NULL DEFAULT false,
        "email" text NOT NULL UNIQUE,
        "email_verified" boolean NOT NULL DEFAULT false,
        "password_hash" text,
        "role" text NOT NULL DEFAULT 'CUSTOMER',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "otp_codes" (
        "id" text PRIMARY KEY,
        "identifier" text NOT NULL,
        "channel" text NOT NULL,
        "code" text NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "consumed" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "description" text NOT NULL DEFAULT '',
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "templates" (
        "id" text PRIMARY KEY,
        "title" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "description" text NOT NULL DEFAULT '',
        "base_price" integer NOT NULL DEFAULT 0,
        "demo_url" text NOT NULL DEFAULT '',
        "cover_image" text NOT NULL DEFAULT '',
        "images" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "features" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "tech_stack" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "is_active" boolean NOT NULL DEFAULT true,
        "is_featured" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "template_categories" (
        "template_id" text NOT NULL REFERENCES "templates"("id") ON DELETE CASCADE,
        "category_id" text NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
        PRIMARY KEY ("template_id", "category_id")
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" text PRIMARY KEY,
        "title" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "content" text NOT NULL DEFAULT '',
        "excerpt" text NOT NULL DEFAULT '',
        "cover_image" text NOT NULL DEFAULT '',
        "seo_title" text NOT NULL DEFAULT '',
        "meta_description" text NOT NULL DEFAULT '',
        "keywords" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "author_name" text NOT NULL DEFAULT 'مدیرعامل ZeNOxWeb',
        "is_published" boolean NOT NULL DEFAULT false,
        "published_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "hosting_plans" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "tier" text NOT NULL DEFAULT 'BASIC',
        "monthly_cost" integer NOT NULL DEFAULT 0,
        "description" text NOT NULL DEFAULT '',
        "capacity" integer NOT NULL DEFAULT 20,
        "used_capacity" integer NOT NULL DEFAULT 0,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" text PRIMARY KEY,
        "customer_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "template_id" text NOT NULL REFERENCES "templates"("id"),
        "hosting_plan_id" text NOT NULL REFERENCES "hosting_plans"("id"),
        "customization_notes" text NOT NULL DEFAULT '',
        "quoted_design_price" integer,
        "hosting_price" integer NOT NULL DEFAULT 0,
        "admin_note" text,
        "total_price" integer,
        "status" text NOT NULL DEFAULT 'AWAITING_QUOTE',
        "domain" text,
        "server_info" text,
        "payment_ref_id" text,
        "quoted_at" timestamptz,
        "approved_at" timestamptz,
        "paid_at" timestamptz,
        "delivered_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id" text PRIMARY KEY,
        "order_id" text NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "gateway" text NOT NULL DEFAULT 'MOCK',
        "amount" integer NOT NULL,
        "status" text NOT NULL DEFAULT 'PENDING',
        "ref_id" text,
        "authority" text,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "site_visits" (
        "id" text PRIMARY KEY,
        "path" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id" text PRIMARY KEY,
        "site_name" text NOT NULL DEFAULT 'ZeNOxWeb',
        "hero_title" text NOT NULL DEFAULT '',
        "hero_subtitle" text NOT NULL DEFAULT '',
        "hero_cta_text" text NOT NULL DEFAULT 'ساخت سایت شخصی خودتون',
        "hero_cta_link" text NOT NULL DEFAULT '/shop',
        "enamad_image" text NOT NULL DEFAULT '',
        "enamad_link" text NOT NULL DEFAULT '',
        "telegram_id" text NOT NULL DEFAULT '',
        "whatsapp_number" text NOT NULL DEFAULT '',
        "support_email" text NOT NULL DEFAULT '',
        "support_phone" text NOT NULL DEFAULT '',
        "address" text NOT NULL DEFAULT '',
        "socials" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "homepage_blocks" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "gateway_name" text NOT NULL DEFAULT 'MOCK',
        "gateway_merchant_id" text NOT NULL DEFAULT '',
        "gateway_enabled" boolean NOT NULL DEFAULT true,
        "support_email_template" text NOT NULL DEFAULT '',
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "support_tickets" (
        "id" text PRIMARY KEY,
        "customer_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "order_id" text REFERENCES "orders"("id") ON DELETE SET NULL,
        "subject" text NOT NULL,
        "message" text NOT NULL,
        "status" text NOT NULL DEFAULT 'OPEN',
        "priority" text NOT NULL DEFAULT 'NORMAL',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "ticket_replies" (
        "id" text PRIMARY KEY,
        "ticket_id" text NOT NULL REFERENCES "support_tickets"("id") ON DELETE CASCADE,
        "sender_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "message" text NOT NULL,
        "is_staff" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ستون‌هایی که ممکن است روی دیتابیس‌های قدیمی وجود نداشته باشند
    await db.execute(sql`
      ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "support_email_template" text NOT NULL DEFAULT '';
    `);
    await db.execute(sql`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true;
    `);
    await db.execute(sql`
      ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "cover_image" text NOT NULL DEFAULT '';
    `);
    await db.execute(sql`
      ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "is_featured" boolean NOT NULL DEFAULT false;
    `);
    await db.execute(sql`
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "hosting_price" integer NOT NULL DEFAULT 0;
    `);

    migrated = true;
  } catch (error) {
    console.error("schema migration failed", error);
    migratePromise = null;
    throw error;
  }
}
