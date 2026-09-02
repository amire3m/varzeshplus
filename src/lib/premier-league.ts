export type PLTeam = {
  id: number;
  name: string;
  short: string;
  badge: string;
  color: string;
};

export type PLStanding = {
  teamId: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  pts: number;
};

export type PLMatch = {
  id: number;
  homeId: number;
  awayId: number;
  homeScore: number | null;
  awayScore: number | null;
  status: "live" | "upcoming" | "finished";
  minute: number | null;
  kickoff: string;
  matchweek: number;
  competition: string;
};

export type PLNews = {
  id: number;
  title: string;
  summary: string;
  image: string;
  publishedAt: string;
  tag: string;
  teamId: number | null;
  hot?: boolean;
};

export type PLTransfer = {
  id: number;
  player: string;
  fromId: number;
  toId: number;
  fee: string | null;
  type: "loan" | "permanent" | "free";
  date: string;
  official: boolean;
  incoming: boolean;
};

export type PLPlayerStat = {
  rank: number;
  player: string;
  teamId: number;
  value: number;
};

export const PL_LOGO =
  "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/160px-Premier_League_Logo.svg.png";

export const TEAMS: PLTeam[] = [
  { id: 1, name: "آرسنال", short: "ARS", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/80px-Arsenal_FC.svg.png", color: "#EF0107" },
  { id: 2, name: "استون ویلا", short: "AVL", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Aston_Villa_FC_crest_%282016%29.svg/80px-Aston_Villa_FC_crest_%282016%29.svg.png", color: "#670E36" },
  { id: 3, name: "بورنموث", short: "BOU", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/AFC_Bournemouth_%282013%29.svg/80px-AFC_Bournemouth_%282013%29.svg.png", color: "#DA291C" },
  { id: 4, name: "برنتفورد", short: "BRE", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Brentford_FC_crest.svg/80px-Brentford_FC_crest.svg.png", color: "#E30613" },
  { id: 5, name: "برایتون", short: "BHA", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/80px-Brighton_%26_Hove_Albion_logo.svg.png", color: "#0057B8" },
  { id: 6, name: "چلسی", short: "CHE", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/80px-Chelsea_FC.svg.png", color: "#034694" },
  { id: 7, name: "کریستال پالاس", short: "CRY", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Crystal_Palace_FC_logo.svg/80px-Crystal_Palace_FC_logo.svg.png", color: "#1B458F" },
  { id: 8, name: "اورتون", short: "EVE", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/80px-Everton_FC_logo.svg.png", color: "#003399" },
  { id: 9, name: "فولام", short: "FUL", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%282013%29.svg/80px-Fulham_FC_%282013%29.svg.png", color: "#000000" },
  { id: 10, name: "ایپسویچ", short: "IPS", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Ipswich_Town_logo.svg/80px-Ipswich_Town_logo.svg.png", color: "#0033A0" },
  { id: 11, name: "لیورپول", short: "LIV", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/80px-Liverpool_FC.svg.png", color: "#C8102E" },
  { id: 12, name: "منچسترسیتی", short: "MCI", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/80px-Manchester_City_FC_badge.svg.png", color: "#6CABDD" },
  { id: 13, name: "منچستریونایتد", short: "MUN", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Manchester_United_FC_crest.svg/80px-Manchester_United_FC_crest.svg.png", color: "#DA291C" },
  { id: 14, name: "نیوکاسل", short: "NEW", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/80px-Newcastle_United_Logo.svg.png", color: "#241F20" },
  { id: 15, name: "ناتینگهام فارست", short: "NFO", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/5/57/Nottingham_Forest_FC_logo.svg/80px-Nottingham_Forest_FC_logo.svg.png", color: "#DD0000" },
  { id: 16, name: "ساوت‌همپتون", short: "SOU", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/FC_Southampton.svg/80px-FC_Southampton.svg.png", color: "#D71920" },
  { id: 17, name: "تاتنهام", short: "TOT", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/80px-Tottenham_Hotspur.svg.png", color: "#132257" },
  { id: 18, name: "وست‌هم", short: "WHU", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/West_Ham_United_FC_logo.svg/80px-West_Ham_United_FC_logo.svg.png", color: "#7A263A" },
  { id: 19, name: "ولورهمپتون", short: "WOL", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Wolverhampton_Wanderers_FC_logo.svg/80px-Wolverhampton_Wanderers_FC_logo.svg.png", color: "#FDB913" },
  { id: 20, name: "لوتون تاون", short: "LUT", badge: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Luton_Town_logo.svg/80px-Luton_Town_logo.svg.png", color: "#FF5F00" },
];

export const STANDINGS: PLStanding[] = [
  { teamId: 11, played: 34, win: 25, draw: 7, loss: 2, gf: 82, ga: 31, pts: 82 },
  { teamId: 1, played: 34, win: 24, draw: 6, loss: 4, gf: 78, ga: 29, pts: 78 },
  { teamId: 12, played: 34, win: 22, draw: 6, loss: 6, gf: 74, ga: 38, pts: 72 },
  { teamId: 14, played: 34, win: 20, draw: 9, loss: 5, gf: 69, ga: 40, pts: 69 },
  { teamId: 6, played: 34, win: 18, draw: 8, loss: 8, gf: 62, ga: 45, pts: 62 },
  { teamId: 2, played: 34, win: 17, draw: 9, loss: 8, gf: 60, ga: 44, pts: 60 },
  { teamId: 15, played: 34, win: 16, draw: 8, loss: 10, gf: 55, ga: 42, pts: 56 },
  { teamId: 13, played: 34, win: 15, draw: 10, loss: 9, gf: 52, ga: 41, pts: 55 },
  { teamId: 17, played: 34, win: 14, draw: 8, loss: 12, gf: 58, ga: 52, pts: 50 },
  { teamId: 5, played: 34, win: 13, draw: 10, loss: 11, gf: 51, ga: 50, pts: 49 },
  { teamId: 3, played: 34, win: 13, draw: 9, loss: 12, gf: 48, ga: 47, pts: 48 },
  { teamId: 8, played: 34, win: 12, draw: 11, loss: 11, gf: 44, ga: 43, pts: 47 },
  { teamId: 9, played: 34, win: 11, draw: 10, loss: 13, gf: 47, ga: 49, pts: 43 },
  { teamId: 4, played: 34, win: 10, draw: 12, loss: 12, gf: 46, ga: 50, pts: 42 },
  { teamId: 18, played: 34, win: 10, draw: 9, loss: 15, gf: 43, ga: 55, pts: 39 },
  { teamId: 7, played: 34, win: 9, draw: 10, loss: 15, gf: 40, ga: 54, pts: 37 },
  { teamId: 19, played: 34, win: 8, draw: 8, loss: 18, gf: 38, ga: 60, pts: 32 },
  { teamId: 10, played: 34, win: 6, draw: 11, loss: 17, gf: 34, ga: 58, pts: 29 },
  { teamId: 16, played: 34, win: 5, draw: 9, loss: 20, gf: 30, ga: 66, pts: 24 },
  { teamId: 20, played: 34, win: 4, draw: 8, loss: 22, gf: 27, ga: 71, pts: 20 },
];

export const MATCHES: PLMatch[] = [
  { id: 1, homeId: 11, awayId: 12, homeScore: 2, awayScore: 1, status: "finished", minute: null, kickoff: "امروز ۱۸:۳۰", matchweek: 34, competition: "پریمیرلیگ" },
  { id: 2, homeId: 1, awayId: 14, homeScore: 1, awayScore: 1, status: "finished", minute: null, kickoff: "امروز ۱۶:۰۰", matchweek: 34, competition: "پریمیرلیگ" },
  { id: 3, homeId: 6, awayId: 17, homeScore: null, awayScore: null, status: "live", minute: 63, kickoff: "در جریان", matchweek: 34, competition: "پریمیرلیگ" },
  { id: 4, homeId: 13, awayId: 2, homeScore: null, awayScore: null, status: "live", minute: 38, kickoff: "در جریان", matchweek: 34, competition: "پریمیرلیگ" },
  { id: 5, homeId: 15, awayId: 8, homeScore: null, awayScore: null, status: "upcoming", minute: null, kickoff: "امروز ۲۱:۰۰", matchweek: 34, competition: "پریمیرلیگ" },
  { id: 6, homeId: 5, awayId: 3, homeScore: null, awayScore: null, status: "upcoming", minute: null, kickoff: "فردا ۱۷:۰۰", matchweek: 35, competition: "پریمیرلیگ" },
  { id: 7, homeId: 9, awayId: 11, homeScore: 0, awayScore: 3, status: "finished", minute: null, kickoff: "شنبه", matchweek: 33, competition: "پریمیرلیگ" },
  { id: 8, homeId: 12, awayId: 1, homeScore: 2, awayScore: 2, status: "finished", minute: null, kickoff: "یک‌شنبه", matchweek: 33, competition: "پریمیرلیگ" },
  { id: 9, homeId: 16, awayId: 18, homeScore: 1, awayScore: 2, status: "finished", minute: null, kickoff: "شنبه", matchweek: 33, competition: "پریمیرلیگ" },
];

export const NEWS: PLNews[] = [
  { id: 1, title: "سلطه سرخ‌ها؛ لیورپول یک قدم تا قهرمانی", summary: "پیروزی پرگل برابر فولام، فاصله قرمزها را در صدر جدول به ۴ امتیاز رساند و راه را برای جشن قهرمانی در آنفیلد هموار کرد.", image: "https://picsum.photos/seed/pl1/900/500", publishedAt: "۲ ساعت پیش", tag: "بازی", teamId: 11, hot: true },
  { id: 2, title: "هت‌تریک هالند در اتحاد", summary: "ستاره نروژی با سه گل، سیتی را در کورس قهرمانی نگه داشت.", image: "https://picsum.photos/seed/pl2/600/400", publishedAt: "۵ ساعت پیش", tag: "بازی", teamId: 12, hot: true },
  { id: 3, title: "درامای دربی لندن؛ تساوی‌ای که به درد هیچ‌کس نخورد", summary: "چلسی و تاتنهام در یک دیدار پرافت‌وخیز به تساوی رضایت دادند.", image: "https://picsum.photos/seed/pl3/600/400", publishedAt: "۸ ساعت پیش", tag: "بازی", teamId: 6, hot: true },
  { id: 4, title: "شکست تلخ ساوت‌همپتون و گامی دیگر به سقوط", summary: "قدیس‌ها در خانه باختند و حالا ۷ امتیاز با منطقه امن فاصله دارند.", image: "https://picsum.photos/seed/pl4/600/400", publishedAt: "دیروز", tag: "تحلیل", teamId: 16 },
  { id: 5, title: "رادار تیم ملی برای ستاره‌های درخشان فصل", summary: "عملکرد درخشان چند بازیکن جوان، توجه کادرفنی تیم ملی را جلب کرده است.", image: "https://picsum.photos/seed/pl5/600/400", publishedAt: "۲ روز پیش", tag: "تیم ملی", teamId: null },
  { id: 6, title: "بحران مهاجم در اولدترافورد", summary: "منچستریونایتد در گلزنی ناکام است و هواداران نگران ادامه فصل هستند.", image: "https://picsum.photos/seed/pl6/600/400", publishedAt: "۲ روز پیش", tag: "تحلیل", teamId: 13 },
  { id: 7, title: "مهاجم برزیلی نیوکاسل؛ شکارچی شب‌های اروپا", summary: "با ۹ گل در ۱۰ بازی اخیر، ستاره برزیلی به مهره اصلی کلاغ‌ها تبدیل شده است.", image: "https://picsum.photos/seed/pl7/600/400", publishedAt: "۳ روز پیش", tag: "ویژه", teamId: 14 },
];

export const TRANSFERS: PLTransfer[] = [
  { id: 1, player: "کای هاورتس", fromId: 6, toId: 11, fee: "۴۵ میلیون یورو", type: "permanent", date: "۲ هفته پیش", official: true, incoming: true },
  { id: 2, player: "آنتونی", fromId: 13, toId: 3, fee: null, type: "loan", date: "۱ هفته پیش", official: true, incoming: false },
  { id: 3, player: "مارتین اودگارد", fromId: 1, toId: 14, fee: "۶۰ میلیون یورو", type: "permanent", date: "۳ روز پیش", official: true, incoming: true },
  { id: 4, player: "فیل فودن", fromId: 12, toId: 6, fee: null, type: "free", date: "دیروز", official: true, incoming: true },
  { id: 5, player: "کریستوفر انکونکو", fromId: 6, toId: 13, fee: "۵۵ میلیون یورو", type: "permanent", date: "۵ روز پیش", official: false, incoming: true },
  { id: 6, player: "ویل‌فرید زاها", fromId: 3, toId: 17, fee: "۲۰ میلیون یورو", type: "permanent", date: "۱ هفته پیش", official: false, incoming: true },
  { id: 7, player: "هاروی الیوت", fromId: 11, toId: 5, fee: null, type: "loan", date: "۲ روز پیش", official: true, incoming: false },
  { id: 8, player: "جودی بلینگام", fromId: 2, toId: 12, fee: "۷۵ میلیون یورو", type: "permanent", date: "امروز", official: false, incoming: true },
];

export const TOP_SCORERS: PLPlayerStat[] = [
  { rank: 1, player: "ارلینگ هالند", teamId: 12, value: 27 },
  { rank: 2, player: "محمد صلاح", teamId: 11, value: 24 },
  { rank: 3, player: "الکساندر ایساک", teamId: 14, value: 20 },
  { rank: 4, player: "بوکایو ساکا", teamId: 1, value: 17 },
  { rank: 5, player: "کول پالمر", teamId: 6, value: 15 },
];

export const TOP_ASSISTS: PLPlayerStat[] = [
  { rank: 1, player: "کوین دی‌بروینه", teamId: 12, value: 16 },
  { rank: 2, player: "محمد صلاح", teamId: 11, value: 14 },
  { rank: 3, player: "مارتین اودگارد", teamId: 1, value: 11 },
  { rank: 4, player: "سونی", teamId: 17, value: 10 },
  { rank: 5, player: "جیمز مدیسون", teamId: 14, value: 9 },
];

export const CLEAN_SHEETS: PLPlayerStat[] = [
  { rank: 1, player: "آلیسون بکر", teamId: 11, value: 17 },
  { rank: 2, player: "داوید رایا", teamId: 1, value: 15 },
  { rank: 3, player: "ادرسون", teamId: 12, value: 13 },
  { rank: 4, player: "نیک پوپ", teamId: 14, value: 11 },
  { rank: 5, player: "رابرت سانچس", teamId: 6, value: 9 },
];

export function teamById(id: number): PLTeam {
  return TEAMS.find((t) => t.id === id) ?? TEAMS[0];
}
