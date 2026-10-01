# ورزش‌پلاس → FotMob — Spec هیبریدی (Stadium Night حفظ)

**تاریخ:** 2026-10-01
**وضعیت:** Approved for planning (هر دو: بصری+فیچر، هیبریدی داده، Stadium Night پیش‌فرض، فازبندی کم‌کم)
**منبع نمونه:** `apk-nemone/FotMob_237.17614.20260921.apk` (3846 entry, 33 activity_* / 48 fragment_*)

## 1) هدف و محدوده
- هدف: سایت ورزش‌پلاس به‌تدریج از نظر **دیداری** (چگالی، کارت‌ها، تایپوگرافی، فاصله‌گذاری) و **فیچری** (ساختار اطلاعات، ناوبری، جزئیات مسابقه/لیگ/تیم) به FotMob نزدیک شود، **بدون** کنار گذاشتن تم Stadium Night تیره (`#0A0F0B`/`#4AE183`/`#FFD34D`) و بدون لایت‌مود اجباری در فاز اول.
- داده هیبریدی: هر جا endpoint عمومی FotMob بدون auth در دسترس بود (`pub.fotmob.com` برای اخبار/نقل‌وانتقالات/جزئیات) از پروکسی سرور بخوانیم؛ نتایج زنده/آمار عمیق از منابع رسمی فعلی (`worldcup26.ir` + ESPN + openfootball/real-data) بماند و فقط شکل داده FotMob-like شود.
- فازبندی: 4 فاز مستقل که هر کدام نرم‌افزارِ قابل تست و قابل دیپلوی تحویل می‌دهد.

## 2) شواهد کامل از APK (برای نگاشت — 33 activity / 48 fragment / 200 BottomSheet)
- `activity_main.xml` + `fragment_live_matches_pager.xml` + `main_navigation.xml` + `fragment_favorites*` + `fragment_more.xml` → Bottom nav + ViewPager + علاقه‌مندی
- `item_single_match_card.xml` / `fixture_match_line[_live].xml` / `live_match_line.xml` / `h2h_match_line.xml` → ردیف مسابقه 48px فشرده (20px لوگو، tabular وسط)
- `activity_match.xml` + `fragment_matchevents/stats/h2h` + `match_facts_bar_stat/momentum/penalty_shootout_line` + `ltc_line*` → تب‌های جزئیات مسابقه (Overview/Events/Stats/Lineup/H2H/Momentum/Penalty)
- `fragment_league_table.xml` + `table_line/table_header/include_table_xg` + `knockout_bracket_view/playoff_brackets_match_view` → جدول سبک + براکت حذفی + xG جدول
- `bottomsheet_filter_list/filter_news_for_you/odds_format/player_stats/xg/market_value_info/percentile_rank` + `design_bottom_sheet_dialog` → BottomSheet فیلتر/جزئیات (همه)
- `activity_onboarding_start.xml` + `quickstart_onboarding` + `onboarding_league_item/grid_item` + `fragment_onboarding_with_tabs` → آنبوردینگ لیگ/تیم/بازیکن
- `fragment_transfers_list.xml` + `transfers_list_item/team_transfers_list_item` + `news_item_transfer_center_top_transfers` → مرکز نقل‌وانتقالات + top_transfers
- `fragment_news_pager.xml` + `fragment_news_list_v2/league_team` + `fragment_news_alerts` + `news_carousel_item/must_read` + `news_item_big/small/big_card` → اخبار For You/World + Must Read + اعلان
- `fragment_squad.xml` + `fragment_squad_member_{career,matches,profile,stats}.xml` + `activity_squad_member.xml` + `activity_player_vs_player.xml` + `activity_team_vs_team.xml` → اسکواد + پروفایل بازیکن عمیق + مقایسه
- `player_lineup.xml` + `player_basic_info/stats_heatmap_item/shotmap_item` + `fragment_teamoverview/fixture/stats` → ترکیب چمن + heatmap/shotmap/xG
- `fragment_odds_tab.xml` + `match_odds_item/buttons_line` + `bottomsheet_odds_format` → تب ضرایب
- `fragment_tv.xml` + `activity_tvschedule.xml` + `menu_tv_schedules.xml` → برنامه پخش تلویزیونی
- `activity_predictor*` + `feature.predictor.ui.PredictorWebViewActivity` + `res/raw/predictor_onboarding.mp4` + `bottomsheet_user_prediction` → پیش‌بینی
- `feature.lineupbuilder.LineupBuilderActivity` + `player_lineup` → Lineup Builder
- `res/raw/whats_new_onboarding_dm/lm.mp4` + `default_onboarding.json` + `default_news_config.json` (https://pub.fotmob.com) → آنبوردینگ ویدئو + کانفیگ
- `glance_widget_info` (league/live_score/news/team) + `activity_notifications*` + `PushMessagingService` → نوتیف + ویجت PWA
- Raw: `cheering.mp3/z_kick.mp3/z_whistle` + `lottie_fotmob_logo*` + `swipe_onboarding_interaction.json` → صدا/انیمیشن

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

## 6) فازها (خروجی هر فاز مستقل — پوشش کامل FotMob)
### فاز 1 — فید خانه + لیست مسابقه فشرده ✅ (انجام شد)
- `CompactMatchRow` 48px, `LeagueFilterChips`, `LeagueHeader` سبک‌شده. معیار: خانه/`/live` روان، `tsc` clean.

### فاز 2 — جزئیات مسابقه تب‌دار + BottomSheet ✅ (انجام شد)
- تب‌های `Overview|Events|Stats|Lineup|H2H` + `MatchTabBar` underline + `BottomSheet`. معیار: 5 تب با URL, bdi حفظ.

### فاز 3 — جدول لیگ/تیم + علاقه‌مندی ✅ (انجام شد)
- `StandingsTable` فشرده (zebra 0.02), `TeamHeader` + `FavoriteStar` (localStorage), `lib/favorites`. معیار: ستاره پایدار.

### فاز 4 — پروکسی هیبریدی + مرکز نقل‌وانتقالات ✅ (انجام شد)
- `api/fotmob/[...path]` پروکسی + `lib/fotmob` + `TransferCenter` (fotmob→fallback). معیار: `/api/fotmob/*` 200.

### فاز 5 — مرکز اخبار + برنامه پخش + ضرایب (جدید)
- **اخبار:** `fragment_news_pager/news_list_v2/must_read` → `NewsCenter` با تب‌های For You/World + کاروسل Must Read افقی + `news_item_big/small` کارت، فچ هیبریدی `pub.fotmob.com/prod/news/api/page?lang=fa` + فالبک RSS داخلی, کش 120s.
- **برنامه پخش:** `activity_tvschedule/fragment_tv` → `/tv` با لیست کانال/ساعت پخش هر مسابقه (موک + فچ fotmob tv), BottomSheet فیلتر لیگ.
- **ضرایب:** `fragment_odds_tab/match_odds_item/buttons_line` → تب Odds در صفحه مسابقه (نمایش 1X2 + over/under موک, BottomSheet توضیح فرمت).
- معیار: `/news` و `/tv` با فیلتر لیگ, تب Odds در `/football/matches/[id]/odds`.

### فاز 6 — پروفایل بازیکن عمیق + مقایسه (جدید)
- **پروفایل:** `fragment_squad_member_{profile,career,matches,stats}` + `player_stats_heatmap/shotmap/percentile_rank/market_value` → `/football/players/[id]` 4 تب (پروفایل/آمار/مسابقات/کارنامه) + heatmap + shotmap + percentile + ارزش بازار (موک + fotmob اگر در دسترس).
- **مقایسه:** `activity_player_vs_player` + `activity_team_vs_team` → `/compare/player?ids=...` و `/compare/team?slugs=...` (جدول مقایسه آمار + H2H).
- معیار: پروفایل 4 تب با URL, مقایسه دوتایی.

### فاز 7 — Predictor + Lineup Builder + آنبوردینگ (جدید)
- **Predictor:** `PredictorWebViewActivity` + `bottomsheet_user_prediction` + `predictor_onboarding.mp4` → `/games/predictor` ارتقا (رأی کاربر + درصد جامعه, BottomSheet رأی).
- **Lineup Builder:** `LineupBuilderActivity` + `player_lineup.xml` + چمن موجود `FootballPitch` → `/games/lineup-builder` (چینش 11 نفره drag, ذخیره localStorage).
- **آنبوردینگ:** `activity_onboarding_start/quickstart` + `onboarding_league_item/grid_item` + `whats_new_onboarding` → `/onboarding` 3 مرحله (لیگ → تیم → بازیکن) + ذخیره در `favorites` + اسکیپ.
- معیار: onboarding قابل اسکیپ, lineup ذخیره‌شونده, predictor رأی‌دهی.

### فاز 8 — نوتیفیکیشن + ویجت PWA + جستجوی پیشرفته (جدید)
- **نوتیف:** `activity_notifications` + `PushMessagingService` → Web Push stub (درخواست permission + سوییچ گل/کارت/شروع بازی, ذخیره در localStorage, بدون سرویس واقعی).
- **ویجت PWA:** `glance_widget_info` (live_score/league/team/news) → `src/components/pwa/GlanceWidget.tsx` (کارت کوچک قابل نصب, نمایش فشرده مسابقه/جدول).
- **جستجوی پیشرفته:** `searchable_leagues.xml` + `fragment_favorites` + تاریخچه + پیشنهاد fotmob → ارتقای `FixedChrome` search (تاریخچه, suggestion, فیلتر نوع).
- معیار: نوتیف سوییچ‌ها پایدار, ویجت قابل نصب, جستجو با تاریخچه.

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
