"use server";

import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  clearSessionCookie,
  getCurrentUser,
  hashPassword,
  newId,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { consumeOtp, isRateLimited, issueOtp, showDevCode } from "@/lib/otp";

export type ActionState = { ok: boolean; message: string; devCode?: string };

const normalizePhone = (p: string) => p.replace(/\s|-/g, "").trim();

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (name.length < 3) return { ok: false, message: "نام باید حداقل ۳ کاراکتر باشد." };
  if (!/^09\d{9}$/.test(phone)) return { ok: false, message: "شماره موبایل معتبر نیست (مثال: 09121234567)." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "ایمیل معتبر نیست." };
  if (password.length < 8) return { ok: false, message: "رمز عبور باید حداقل ۸ کاراکتر باشد." };

  const existing = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.phone, phone)))
    .limit(1);
  if (existing[0]) return { ok: false, message: "کاربری با این ایمیل یا موبایل قبلا ثبت شده است." };

  const id = newId();
  await db.insert(users).values({
    id,
    name,
    email,
    phone,
    passwordHash: hashPassword(password),
    role: "CUSTOMER",
  });
  await setSessionCookie(id);
  redirect("/verify");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const identifier = String(formData.get("identifier") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) return { ok: false, message: "اطلاعات ورود را کامل کنید." };

  const rows = await db
    .select()
    .from(users)
    .where(or(eq(users.email, identifier), eq(users.phone, normalizePhone(identifier))))
    .limit(1);
  const user = rows[0];
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, message: "ایمیل/موبایل یا رمز عبور اشتباه است." };
  }
  await setSessionCookie(user.id);
  if (user.role === "ADMIN" || user.role === "OWNER") redirect("/admin");
  if (!user.phoneVerified || !user.emailVerified) redirect("/verify");
  redirect("/account");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function sendOtpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "ابتدا وارد حساب شوید." };
  const channel = String(formData.get("channel") ?? "PHONE") as "PHONE" | "EMAIL";
  const identifier = channel === "PHONE" ? user.phone : user.email;

  if (await isRateLimited(identifier)) {
    return { ok: false, message: "تعداد درخواست بیش از حد مجاز است. چند دقیقه صبر کنید." };
  }
  const code = await issueOtp(identifier, channel);
  return {
    ok: true,
    message: channel === "PHONE" ? "کد تایید پیامک شد." : "کد تایید به ایمیل شما ارسال شد.",
    devCode: showDevCode ? code : undefined,
  };
}

export async function verifyOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "ابتدا وارد حساب شوید." };
  const channel = String(formData.get("channel") ?? "PHONE") as "PHONE" | "EMAIL";
  const code = String(formData.get("code") ?? "");
  const identifier = channel === "PHONE" ? user.phone : user.email;

  const ok = await consumeOtp(identifier, code);
  if (!ok) return { ok: false, message: "کد وارد شده نامعتبر یا منقضی شده است." };

  await db
    .update(users)
    .set(channel === "PHONE" ? { phoneVerified: true } : { emailVerified: true })
    .where(eq(users.id, user.id));
  revalidatePath("/verify");
  return { ok: true, message: channel === "PHONE" ? "موبایل تایید شد ✅" : "ایمیل تایید شد ✅" };
}
