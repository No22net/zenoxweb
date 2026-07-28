#!/usr/bin/env bash
# راه‌اندازی اولیه ZeNOxWeb روی سرور جدید
set -euo pipefail

if [ ! -f .env ]; then
  echo "==> ساخت .env از روی .env.example"
  cp .env.example .env
  echo "!! مقادیر .env را ویرایش کنید و دوباره اجرا کنید."
fi

echo "==> نصب وابستگی‌ها"
npm install

echo "==> اعمال ساختار دیتابیس (drizzle push)"
npx drizzle-kit push --force || npx drizzle-kit push

echo "==> ساخت نسخه پروداکشن"
npm run build

echo "==> اجرای سرویس"
npm run start
