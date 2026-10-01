# ورزش‌پلاس → FotMob — Spec هیبریدی (Stadium Night حفظ)

**تاریخ:** 2026-10-01
**وضعیت:** Approved for planning (هر دو: بصری+فیچر، هیبریدی داده، Stadium Night پیش‌فرض، فازبندی کم‌کم)
**منبع نمونه:** `apk-nemone/FotMob_237.17614.20260921.apk` (3846 entry, 33 activity_* / 48 fragment_*)

## 1) هدف و محدوده
- هدف: سایت ورزش‌پلاس به‌تدریج از نظر **دیداری** (چگالی، کارت‌ها، تایپوگرافی، فاصله‌گذاری) و **فیچری** (ساختار اطلاعات، ناوبری، جزئیات مسابقه/لیگ/تیم) به FotMob نزدیک شود، **بدون** کنار گذاشتن تم Stadium Night تیره (`#0A0F0B`/`#4AE183`/`#FFD34D`) و بدون لایت‌مود اجباری در فاز اول.
- داده هیبریدی: هر جا endpoint عمومی FotMob بدون auth در دسترس بود (`pub.fotmob.com` برای اخبار/نقل‌وانتقالات/جزئیات) از پروکسی سرور بخوانیم؛ نتایج زنده/آمار عمیق از منابع رسمی فعلی (`worldcup26.ir` + ESPN + openfootball/real-data) بماند و فقط شکل داده FotMob-like شود.
- فازبندی: 4 فاز مستقل که هر کدام نرم‌افزارِ قابل تست و قابل دیپلوی تحویل می‌دهد.

## 2) شواهد از APK (برای نگاشت)
- `activity_main.xml` + `fragment_live_matches_pager.xml` + `main_navigation.xml` → Bottom nav + ViewPager تب‌ها
- `item_single_match_card.xml` / `fixture_match_line_live.xml` / `live_match_line.xml` → ردیف مسابقه 48px فشرده، لوگو 20px، امتیاز tabular وسط
- `activity_match.xml` + `fragment_matchevents/stats/h2h` + `match_facts_bar_stat/momentum` → تب‌های جزئیات مسابقه (Overview/Events/Stats/Lineup/H2H)
- `fragment_league_table.xml` + `table_line/table_header` + `knockout_bracket_view.xml` → جدول و براکت حذفی
- `bottomsheet_filter_list/odds_format/player_stats/xg` → BottomSheet فیلتر/جزئیات
- `activity_onboarding_start.xml` + `onboarding_league_item` → آنبوردینگ لیگ/تیم/بازیکن
- `fragment_transfers_list.xml` + `news_carousel_must_read` → مرکز نقل‌وانتقالات و کاروسل اخبار
- Raw: `predictor_onboarding.mp4`, `default_onboarding.json`, `default_news_config.json` (https://pub.fotmob.com)

## 3) معماری فعلی ورزش‌پلاس (خلاصه)
- Next 16 App Router, React 19, Tailwind 4, Drizzle (better-sqlite3/pg), 23 صفحه، 27 API, 12 لیگ ~140 تیم (`src/lib/football/leagues.ts`), تم Stadium Night در `src/app/globals.css`, `FixedChrome.tsx` سراسری، صفحه اصلی client-heavy (`src/app/page.tsx:639`).
- داده: لایه استاتیک deterministic + لایه واقعی (Transfermarkt tm-teams, StatsBomb xG, Persian Gulf real).

## 4) اصول طراحی جدید (Stadium Night + FotMob density)
- توکن‌ها در `globals.css` می‌ماند؛ فقط **چگالی** تغییر می‌کند: ردیف مسابقه 48-56px، لوگو 20-24px، فونت tabular 13-14px، فاصله 8-12px، کارت‌ها `border-white/10` بدون نئون اضافی، هدر لیگ بدون گرادینت شدید.
- ناوبری: `FixedChrome` حفظ، اما تب‌های لیگ/مسابقه به تب‌های FotMob-like (underline نازک `#4AE183`، اسکرول افقی) نزدیک شود؛ dock شناور فعلاً بماند ولی `pb-24` کمتر شود.
- فهرست‌ها مجازی‌سازی نشده ولی pagination برای جدول‌های بلند اضافه شود.

## 5) داده هیبریدی — قرارداد
- پروکسی: `src/app/api/fotmob/[...path]/route.ts` → فچ به `https://pub.fotmob.com` با `User-Agent: VarzeshPlus/1.0`, کش `revalidate 60-120s`, `NextResponse` با `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`, فالبک به داده داخلی اگر 429/5xx.
- نگاشت: `FotMobMatch { id, home, away, status, minute, score: [a,b] }` → `VarzeshMatch { id, home, away, homeLogo, awayLogo, score, status, minute, faName }`. فیلد `faName` حفظ.
- امنیت: بدون کلید در کلاینت، فقط سرور پروکسی، `rateLimit` ساده، لاگ `console.warn` برای fallback.

## 6) فازها (خروجی هر فاز مستقل)
### فاز 1 — فید خانه + لیست مسابقه فشرده (بیشترین دیده‌شدن)
- `CompactMatchRow` 48px (جایگزین `MatchGlowCard` پرنئون در خانه/لایو)، `LeagueFilterChips` (پیل‌های FotMob-like)، بازطراحی `LeagueHeader` سبک‌شده.
- معیار پذیرش: خانه و `/live` با 20 مسابقه اسکرول روان، Lighthouse perf ≥85, `tsc --noEmit` clean.

### فاز 2 — جزئیات مسابقه تب‌دار + BottomSheet
- تب‌های `Overview|Events|Stats|Lineup|H2H` در `/football/matches/[matchId]/[[...tab]]`, کامپوننت `MatchTabBar` + `BottomSheet` برای فیلتر/جزئیات آمار, ادغام `probs`/`xg` در Stats.
- معیار: 5 تب قابل اشتراک‌گذاری URL، بازگشت/فوروارد مرورگر درست، bdi برای نام‌ها حفظ (`<bdi>`).

### فاز 3 — جدول لیگ/تیم + پروفایل بازیکن + علاقه‌مندی
- جدول سبک FotMob (zebra کم‌رنگ، rank/pts فشرده)، صفحه تیم 7 تب تمیز، پروفایل بازیکن با heatmap/xG، `useFavorites` (localStorage + `star` pin) + آنبوردینگ لیگ/تیم ساده (بدون ویدیو در فاز 3).
- معیار: فالو/آنفالو تیم/لیگ/بازیکن پایدار، آنبوردینگ 3 مرحله.

### فاز 4 — مرکز نقل‌وانتقالات/اخبار + پیش‌بینی/Lineup + نوتیف/ویجت
- پروکسی `pub.fotmob.com` برای `transfers`/`news`, کاروسل `Must Read`, صفحه `TransferCenter`, ادغام `predictor`/`lineupBuilder`, نوتیف مرورگر (Web Push stub) + PWA widget placeholder.
- معیار: مرکز نقل‌وانتقالات با فیلتر لیگ، کاروسل اخبار با کش.

## 7) محدودیت‌های سراسری
- Next 16.2.6 / React 19 / Tailwind 4.1 / Drizzle 0.45.2 حفظ.
- تم Stadium Night پیش‌فرض؛ هیچ لایت‌مود اجباری در فاز 1-2.
- RTL فارسی حفظ، `<bdi>` برای ترکیب FA/EN.
- `tsc --noEmit` و `next build` باید در هر فاز پاس شود.
- نام پروژه `varzeshplus@1.0.0` حفظ.

## 8) ریسک‌ها
- تغییر endpointهای FotMob → فالبک داخلی همیشه فعال.
- چگالی بالا روی موبایل کوچک → تست روی 360px.
- حجم داده هیبریدی → کش سرور و `revalidate` الزامی.

## 9) خارج از دامنه این Spec
- لایت‌مود کامل، اپ موبایل Flutter، پایپ‌لاین FFmpeg زنده، پرداخت Membership — فازهای بعدی.
