# PROGRESS — ورزش پلاس (Stadium Night)

## Done
- معماری داینامیک لیگ/تیم: `/football/leagues/[leagueSlug]/[[...tab]]` و `/football/teams/[teamSlug]/[[...tab]]` (هر کدام ۷ تب + زیرتب‌های squad/stats).
- لایه داده نرمال‌شده `src/lib/football/*` (types, leagues, data, index).
- ۱۱ لیگ: لیگ برتر انگلیس، لالیگا، سری‌آ، بوندس‌لیگا، لیگ ۱ فرانسه، اردیویسه، لیگ پرتغال، سوپرلیگ ترکیه، لیگ عربستان، سری‌آ برزیل، MLS (~۱۴۰ تیم).
- کامپوننت‌های مشترک `src/components/football/*` و `src/components/layout/FixedChrome.tsx`.
- ریدایرکت `/premier-league` → `/football/leagues/premier-league` و لیست کامل لیگ‌ها در دراور.
- تم نهایی **Stadium Night**: پس‌زمینه `#0A0F0B`/`#101610`/`#161E14`، اکشن `#4AE183`، سیگنال زنده `#FF4757`، طلایی `#FFD34D` — جایگزین پالت قبلی خاکستری/آبی-لیمویی در کل پروژه.
- هدر لیگ و جدول رده‌بندی بازطراحی شده (هیرو استادیوم، کارت‌های انتخاب تعاملی با پرچم، zoneهای سبز/زرد/قرمز).
- صفحه اصلی: هیروی خبر واقعی (RSS خبرورزشی)، گرید ویدیو در بالا، لیست زنده چندلیگی، بخش مینی‌گیم‌ها (`/games`).
- مینی‌گیم‌ها: Footle، Higher/Lower، پیش‌بینی امتیاز، تاکتیک‌بورد، فانتزی لیگ برتر، احتمالات Dixon-Coles و xG.
- پروفایل بازیکن + عکس با کش ۷ روزه + آواتار و صفحه `/football/players/[playerId]`.
- نتایج زنده واقعی (`worldcup26.ir` + فالبک ESPN، کش ۶۰ ثانیه) و اخبار کناری از RSS.

## Verify
- `tsc --noEmit` clean
- `next build` موفق — صفحات اصلی `/`, `/football/leagues/*`, `/football/teams/*`, `/live`, `/games` → 200
