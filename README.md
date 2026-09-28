# ورزش پلاس — Varzesh Plus

پلتفرم ورزشی فارسی (RTL) — نتایج زنده فوتبال، جدول لیگ‌ها، پروفایل بازیکنان، اخبار، ویدیوها و مینی‌گیم‌های تعاملی. طراحی موبایل‌اول با تم **Stadium Night** (پس‌زمینه تیره چمنی + لهجه سبز `#4AE183` و طلایی `#FFD34D`).

## ویژگی‌ها
- **نتایج زنده** چندلیگی (۱۱ لیگ، ~۱۴۰ تیم) — داده زنده از `worldcup26.ir` با فالبک ESPN، به‌روزرسانی ۶۰ ثانیه‌ای
- **لیگ و تیم داینامیک:** `/football/leagues/[slug]` و `/football/teams/[slug]` با ۷ تب و کامپوننت‌های مشترک
- **اخبار و حواشی:** فید RSS خبرورزشی + کارت‌های ویدیویی
- **مینی‌گیم‌ها:** Footle، Higher/Lower، پیش‌بینی امتیاز، تاکتیک‌بورد، فانتزی لیگ برتر، احتمالات مسابقات
- **جستجوی سراسری** تیم/لیگ/بازیکن در هدر + لیدربورد و پروفایل کاربر

## استک فنی
Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Drizzle ORM (better-sqlite3 برای توسعه، آماده PostgreSQL برای استقرار) + TypeScript

## راه‌اندازی محلی
```bash
npm install
npx drizzle-kit push --force   # اعمال اسکیما روی local.db
npm run dev                    # http://localhost:3000
npm run build && npm start     # پروداکشن
npm run typecheck              # tsc --noEmit
```

## ساختار پوشه‌ها
```
src/app/            # صفحات و API routes (App Router)
src/components/     # کامپوننت‌های football / layout / ui
src/lib/football/   # لایه داده، لیگ‌ها، تیم‌ها، xG/احتمالات
src/db/             # اسکیما و seed
drizzle/            # مایگریشن‌ها
scripts/            # اسکریپت‌های کمکی (tm-import و ...)
```

## تم و دیزاین
توکن‌ها در `src/app/globals.css` متمرکز هستند — پس‌زمینه `#0A0F0B`/`#101610`، متن `#EDF3EC`/`#9DAE9C`، اکشن `#4AE183`، سیگنال زنده `#FF4757`، طلایی `#FFD34D`. فونت: Vazirmatn + JetBrains Mono.

## استقرار
پروژه برای استقرار روی VPS با Node 22 + PM2 + Nginx + PostgreSQL آماده است. متغیرهای محیطی را در `.env` تنظیم کنید (`DATABASE_URL` و ...).

## لایسنس
کد این مخزن برای استفاده داخلی تیم ورزش پلاس تهیه شده است.
