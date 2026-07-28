import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { newId } from "./auth";

const WINDOW_MS = 5 * 60 * 1000;

/** ماژول ارسال پیامک — در صورت وجود کلید کاوه‌نگار واقعا ارسال می‌شود. */
async function sendSms(phone: string, code: string) {
  const key = process.env.SMS_API_KEY;
  if (!key) {
    console.log(`[DEV-SMS] کد تایید ${code} برای ${phone}`);
    return;
  }
  try {
    await fetch(
      `https://api.kavenegar.com/v1/${key}/verify/lookup.json?receptor=${phone}&token=${code}&template=${
        process.env.SMS_TEMPLATE ?? "verify"
      }`,
      { method: "GET" },
    );
  } catch (error) {
    console.error("SMS send failed", error);
  }
}

/** ماژول ارسال ایمیل — در صورت وجود کلید Resend واقعا ارسال می‌شود. */
async function sendEmail(email: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[DEV-EMAIL] کد تایید ${code} برای ${email}`);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? "noreply@zenoxweb.ir",
        to: email,
        subject: "کد تایید ZeNOxWeb",
        html: `<p>کد تایید شما: <b>${code}</b></p>`,
      }),
    });
  } catch (error) {
    console.error("Email send failed", error);
  }
}

/** محدودیت نرخ ساده: حداکثر ۳ کد در ۵ دقیقه برای هر شناسه */
export async function isRateLimited(identifier: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const rows = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.identifier, identifier), gt(otpCodes.createdAt, since)));
  return rows.length >= 3;
}

export async function issueOtp(identifier: string, channel: "PHONE" | "EMAIL"): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await db.insert(otpCodes).values({
    id: newId(),
    identifier,
    channel,
    code,
    expiresAt: new Date(Date.now() + WINDOW_MS),
  });
  if (channel === "PHONE") await sendSms(identifier, code);
  else await sendEmail(identifier, code);
  return code;
}

export async function consumeOtp(identifier: string, code: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.identifier, identifier),
        eq(otpCodes.code, code.trim()),
        eq(otpCodes.consumed, false),
        gt(otpCodes.expiresAt, new Date()),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return false;
  await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, row.id));
  return true;
}

/** در محیط توسعه کد را برای نمایش به کاربر برمی‌گردانیم تا تست ممکن باشد. */
export const showDevCode = !process.env.SMS_API_KEY;
