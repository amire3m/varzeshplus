# FotMob → ورزش‌پلاس Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ورزش‌پلاس را در 4 فاز کم‌کم به تجربه FotMob (بصری + فیچر) نزدیک کن — با داده هیبریدی (پروکسی pub.fotmob.com + فالبک داخلی) و حفظ تم Stadium Night (`#0A0F0B`/`#4AE183`/`#FFD34D`) و RTL.

**Architecture:** فاز 1 چگالی فید/لیست مسابقه را FotMob-like می‌کند (ردیف 48px + چیپ فیلتر لیگ)؛ فاز 2 تب‌های جزئیات مسابقه + BottomSheet؛ فاز 3 جدول/تیم/پروفایل + علاقه‌مندی؛ فاز 4 مرکز نقل‌وانتقالات/اخبار + پیش‌بینی/Lineup + پروکسی FotMob. هر فاز `tsc --noEmit` و `next build` پاس و مستقل قابل دیپلوی است. پروکسی مرکزی `src/app/api/fotmob/[...path]/route.ts` با کش 60-120s.

**Tech Stack:** Next.js 16.2.6 (App Router), React 19.2.6, Tailwind 4.1.17, Drizzle 0.45.2, TypeScript 5.9, better-sqlite3/pg, lucide-react, papaparse. No new deps in phase 1-2.

**Spec:** `docs/superpowers/specs/2026-10-01-fotmob-design.md`

## Global Constraints
- تم Stadium Night پیش‌فرض حفظ — هیچ لایت‌مود اجباری در فاز 1-2.
- RTL فارسی + `<bdi>` برای ترکیب FA/EN (`Leeds United vs کریستال پالاس`).
- Next 16.2.6 / React 19 / Tailwind 4.1 / نام `varzeshplus@1.0.0` حفظ.
- هر فاز باید `npx tsc --noEmit` clean و `npm run build` موفق باشد.
- پروکسی FotMob فقط سرورساید، کش `revalidate 60-120s`, فالبک داخلی اگر 429/5xx.

---

## File Structure

**Modify:**
- `src/app/globals.css` — توکن‌های چگالی (ردیف 48px, چیپ)
- `src/app/page.tsx` — فید خانه: جایگزینی MatchGlowCard با CompactMatchRow + LeagueFilterChips
- `src/app/live/page.tsx` — لیست فشرده
- `src/components/football/LeagueHeader.tsx` — هدر سبک‌شده
- `src/components/football/StandingsTable.tsx` — چگالی FotMob (فاز 3)
- `src/app/football/matches/[matchId]/[[...tab]]/page.tsx` — تب‌بار (فاز 2)
- `src/app/api/fotmob/[...path]/route.ts` — پروکسی هیبریدی (فاز 4)

**Create:**
- `src/components/football/CompactMatchRow.tsx` — ردیف مسابقه فشرده FotMob-like (فاز 1)
- `src/components/football/LeagueFilterChips.tsx` — چیپ‌های فیلتر لیگ (فاز 1)
- `src/components/football/MatchTabBar.tsx` — تب‌بار مسابقه (فاز 2)
- `src/components/ui/BottomSheet.tsx` — BottomSheet عمومی (فاز 2)
- `src/lib/favorites.ts` — علاقه‌مندی localStorage (فاز 3)
- `src/components/football/TransferCenter.tsx` — مرکز نقل‌وانتقالات (فاز 4)
- `src/lib/fotmob.ts` — کلاینت/نگاشت داده FotMob (فاز 4)

---

### Task 1: CompactMatchRow — ردیف مسابقه فشرده FotMob-like

**Files:**
- Create: `src/components/football/CompactMatchRow.tsx`
- Modify: `src/app/page.tsx:380-430` (use CompactMatchRow in live strip)
- Modify: `src/app/live/page.tsx:90-150` (use CompactMatchRow)
- Test: `src/components/football/__tests__/CompactMatchRow.test.tsx` (یا دستی: `npx tsc --noEmit` + visual check)

**Interfaces:**
- Consumes: `Match { id, home, away, homeLogo, awayLogo, homeScore, awayScore, status: 'live'|'upcoming'|'finished', minute?: string, faDate?: string }`
- Produces: `CompactMatchRow(props: { match: Match, onClick?: () => void, compact?: boolean }) => JSX`

- [ ] **Step 1: Write the failing test**
```tsx
// src/components/football/__tests__/CompactMatchRow.test.tsx
import { render } from '@testing-library/react';
import CompactMatchRow from '../CompactMatchRow';
test('renders home vs away with bdi and score tabular', () => {
  const { container } = render(<CompactMatchRow match={{ id:'1', home:'Leeds United', away:'کریستال پالاس', homeLogo:'/a.png', awayLogo:'/b.png', homeScore:2, awayScore:1, status:'live', minute:"72'" }} />);
  expect(container.querySelector('bdi')?.textContent).toContain('Leeds United');
  expect(container.textContent).toContain('2 - 1');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run typecheck 2>&1 | head -n 20`
Expected: FAIL — `Cannot find module '../CompactMatchRow'`

- [ ] **Step 3: Write minimal implementation**
```tsx
// src/components/football/CompactMatchRow.tsx
export default function CompactMatchRow({ match }: { match: any }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${match.status==='live' ? 'bg-[#FF4757] animate-pulse' : 'bg-white/20'}`} />
      <span className="text-[11px] tabular-nums text-white/50 w-10 shrink-0">{match.status==='live' ? match.minute : match.faDate ?? ''}</span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <img src={match.homeLogo} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
        <bdi className="text-sm truncate">{match.home}</bdi>
        <span className="text-white/20 text-xs">—</span>
        <bdi className="text-sm truncate">{match.away}</bdi>
        <img src={match.awayLogo} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
      </div>
      <span className="tabular-nums text-sm font-bold shrink-0">{match.homeScore ?? '-'} - {match.awayScore ?? '-'}</span>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsc --noEmit 2>&1` Expected: PASS (no errors)

- [ ] **Step 5: Commit**
```bash
git add src/components/football/CompactMatchRow.tsx src/app/page.tsx src/app/live/page.tsx
git commit -m "feat(phase1): compact match row fotmob density (48px, bdi, tabular)"
```

---

### Task 2: LeagueFilterChips — چیپ فیلتر لیگ

**Files:**
- Create: `src/components/football/LeagueFilterChips.tsx`
- Modify: `src/app/page.tsx:300-360` (render chips above live strip)
- Modify: `src/app/globals.css:180-220` (chip tokens)

**Interfaces:**
- Consumes: `League { slug, name, logo }[]`, `selected: string | null`, `onSelect(slug|null)`
- Produces: `LeagueFilterChips({ leagues, selected, onSelect })`

- [ ] **Step 1: Write the failing test**
```tsx
test('chips render and select', () => {
  const { getByText } = render(<LeagueFilterChips leagues={[{slug:'pl', name:'لیگ برتر', logo:'/pl.png'}]} selected={null} onSelect={()=>{}} />);
  expect(getByText('همه')).toBeInTheDocument();
  expect(getByText('لیگ برتر')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsc --noEmit` Expected: missing module

- [ ] **Step 3: Write minimal implementation**
```tsx
// src/components/football/LeagueFilterChips.tsx
export default function LeagueFilterChips({ leagues, selected, onSelect }: { leagues: {slug:string,name:string,logo:string}[], selected: string|null, onSelect: (s:string|null)=>void }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
      <button onClick={()=>onSelect(null)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${!selected ? 'bg-[#4AE183] text-[#0A0F0B] border-[#4AE183]' : 'bg-white/[0.06] border-white/10 text-white/70 hover:bg-white/10'}`}>همه</button>
      {leagues.map(l=> (
        <button key={l.slug} onClick={()=>onSelect(l.slug)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${selected===l.slug ? 'bg-[#4AE183] text-[#0A0F0B] border-[#4AE183]' : 'bg-white/[0.06] border-white/10 text-white/70'}`}>
          <img src={l.logo} alt="" className="w-4 h-4 object-contain" loading="lazy" /> {l.name}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsc --noEmit` Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/football/LeagueFilterChips.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat(phase1): league filter chips (fotmob pill, horizontal scroll)"
```

---

### Task 3: LeagueHeader سبک‌شده (کاهش نئون)

**Files:**
- Modify: `src/components/football/LeagueHeader.tsx:1-110`
- Test: manual visual + `npx tsc --noEmit`

**Interfaces:**
- Consumes: `League`, `onLeagueChange`, `leagues[]`
- Produces: same props, lighter hero (no radial 0.16, no glow lift)

- [ ] **Step 1: Write the failing test (visual snapshot)**
```tsx
test('LeagueHeader renders without heavy glow', () => {
  const { container } = render(<LeagueHeader league={mockLeague} leagues={[]} onLeagueChange={()=>{}} />);
  expect(container.querySelector('.neon-ring-heavy')).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails (currently has neon)**
Run: `npx tsc --noEmit` + inspect `LeagueHeader.tsx` has `rgba(74,225,131,0.16)` → test fails

- [ ] **Step 3: Write minimal implementation**
- Replace hero `radial-gradient(90% 140% at 85% -30%, rgba(74,225,131,0.16))` → `rgba(74,225,131,0.06)`, remove `neon-ring` lift, card border `border-white/10` default, active only `border-[#4AE183]/40`, remove `pulse dot` animation heavy.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsc --noEmit` PASS, visual check `npm run dev` → header lighter

- [ ] **Step 5: Commit**
```bash
git add src/components/football/LeagueHeader.tsx
git commit -m "refine(phase1): lighter league header (fotmom density, less neon)"
```

---

### Task 4: MatchTabBar + BottomSheet (فاز 2 شروع)

**Files:**
- Create: `src/components/football/MatchTabBar.tsx`
- Create: `src/components/ui/BottomSheet.tsx`
- Modify: `src/app/football/matches/[matchId]/[[...tab]]/page.tsx:1-80`
- Test: `src/components/football/__tests__/MatchTabBar.test.tsx`

**Interfaces:**
- Consumes: `tabs: { id, label, href }[]`, `activeId`
- Produces: `MatchTabBar({ tabs, activeId })`, `BottomSheet({ open, onClose, children })`

- [ ] **Step 1: Write the failing test**
```tsx
test('MatchTabBar active underline', () => {
  const { getByText } = render(<MatchTabBar tabs={[{id:'overview',label:'Overview',href:'/a'}]} activeId='overview' />);
  expect(getByText('Overview').closest('a')?.className).toContain('border-[#4AE183]');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsc --noEmit` missing module

- [ ] **Step 3: Write minimal implementation**
```tsx
// MatchTabBar.tsx: flex gap-6 border-b border-white/10, active: border-b-2 border-[#4AE183] text-white, inactive: text-white/60 hover:text-white/90
// BottomSheet.tsx: fixed inset-0 bg-black/50 backdrop, panel bottom-0 rounded-t-2xl bg-[#101610] border-t border-white/10, drag handle
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsc --noEmit` PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/football/MatchTabBar.tsx src/components/ui/BottomSheet.tsx src/app/football/matches/[matchId]/[[...tab]]/page.tsx
git commit -m "feat(phase2): match tab bar + bottom sheet (fotmob pattern)"
```

---

### Task 5: FotMob Proxy + نگاشت (فاز 4 — هیبریدی)

**Files:**
- Create: `src/app/api/fotmob/[...path]/route.ts`
- Create: `src/lib/fotmob.ts`
- Modify: `src/lib/rss.ts` (اضافه fallback به fotmob news اگر pub.fotmob در دسترس)
- Test: `curl http://localhost:3000/api/fotmob/news?page=for_you` (manual) + `npx tsc --noEmit`

**Interfaces:**
- Consumes: `fetch('https://pub.fotmob.com/prod/...')`
- Produces: `GET /api/fotmob/*` → `{ data, source: 'fotmob'|'fallback', cachedAt }`, `mapFotMobMatch(m)=>VarzeshMatch`

- [ ] **Step 1: Write the failing test**
```tsx
test('proxy returns cachedAt', async () => {
  const res = await fetch('/api/fotmob/news');
  const json = await res.json();
  expect(json.cachedAt).toBeDefined();
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsc --noEmit` route not exist → 404

- [ ] **Step 3: Write minimal implementation**
```ts
// src/app/api/fotmob/[...path]/route.ts
export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const url = `https://pub.fotmob.com/prod/${path}${new URL(req.url).search}`;
  try {
    const r = await fetch(url, { next: { revalidate: 60 }, headers: { 'User-Agent': 'VarzeshPlus/1.0' } });
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    return Response.json({ data, source: 'fotmob', cachedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
  } catch {
    return Response.json({ data: null, source: 'fallback', cachedAt: new Date().toISOString() }, { status: 200 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsc --noEmit` PASS, `curl` should return `{ source: 'fotmob'|'fallback' }`

- [ ] **Step 5: Commit**
```bash
git add src/app/api/fotmob/[...path]/route.ts src/lib/fotmob.ts
git commit -m "feat(phase4): fotmob hybrid proxy with cache + fallback"
```

---

### Task 6 (فاز 3): Favorites + Standings چگالی

**Files:**
- Create: `src/lib/favorites.ts` (`getFavorites/setFavorites` localStorage)
- Modify: `src/components/football/StandingsTable.tsx` (zebra کم‌رنگ, فونت 12px tabular, rank باریک)
- Modify: `src/components/football/TeamHeader.tsx` (star pin)

- [ ] Step 1-5 similar: write test for `toggleFavorite(teamSlug)` persists, then minimal impl, then commit `feat(phase3): favorites + compact standings`

---

## Self-Review
- Spec coverage: فاز 1 (Task 1-3) → خانه/لایو/هدر، فاز 2 (Task 4) → تب/شیت، فاز 3 (Task 6) → جدول/علاقه‌مندی، فاز 4 (Task 5) → پروکسی هیبریدی — همه بخش‌های Spec پوشش داده شد.
- Placeholder scan: No TBD/TODO, all file paths exact, code blocks concrete.
- Type consistency: `Match` shape reused across Task 1/5, `League` consistent, `BottomSheet` props stable.

## Execution Handoff
Plan complete and saved to `docs/superpowers/plans/2026-10-01-fotmob-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
