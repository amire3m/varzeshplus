import { db } from "./index";
import {
  matches,
  quizzes,
  videoChallenges,
  userProfiles,
  leaderboard,
  rewards,
  chatMessages,
  predictions,
} from "./schema";

export async function seedDatabase() {
  try {
    // Check if matches already seeded
    const existingMatches = await db.select().from(matches);
    if (existingMatches.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding Varzesh Plus database...");

    // Seed Matches
    await db.insert(matches).values([
      {
        title: "شهرآورد بزرگ پایتخت (فینال جام حذفی)",
        league: "جام حذفی ایران",
        leagueLogo: "🏆",
        homeTeam: "استقلال",
        homeFlag: "💙",
        awayTeam: "پرسپولیس",
        awayFlag: "❤️",
        homeScore: 2,
        awayScore: 1,
        status: "live",
        matchTime: "امشب - ساعت ۲۰:۰۰",
        minute: "۷۸'",
        stadium: "ورزشگاه آزادی تهران",
        prizePool: "۵۰ میلیون تومان + ۵۰,۰۰۰ سکه",
        heroImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
        isHot: true,
        predictionsCount: 42890,
      },
      {
        title: "ال‌کلاسیکو حساس قهرمانی (هفته ۳۲)",
        league: "لالیگا اسپانیا",
        leagueLogo: "🇪🇸",
        homeTeam: "رئال مادرید",
        homeFlag: "⚪",
        awayTeam: "بارسلونا",
        awayFlag: "🔵🔴",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        matchTime: "فردا - ساعت ۲۲:۳۰",
        minute: null,
        stadium: "سنتیاگو برنابو",
        prizePool: "۳۰ میلیون تومان + ۳۰,۰۰۰ سکه",
        heroImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
        isHot: true,
        predictionsCount: 28450,
      },
      {
        title: "مقدماتی جام جهانی آسیا",
        league: "مقدماتی جام جهانی",
        leagueLogo: "🌍",
        homeTeam: "ایران",
        homeFlag: "🇮🇷",
        awayTeam: "امارات",
        awayFlag: "🇦🇪",
        homeScore: 3,
        awayScore: 0,
        status: "finished",
        matchTime: "دیروز",
        minute: "پایان",
        stadium: "ورزشگاه آزادی",
        prizePool: "۲۰ میلیون تومان",
        heroImage: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
        isHot: false,
        predictionsCount: 35120,
      },
      {
        title: "نبرد نهایی لیگ قهرمانان اروپا",
        league: "لیگ قهرمانان اروپا",
        leagueLogo: "⭐",
        homeTeam: "منچستر سیتی",
        homeFlag: "🩵",
        awayTeam: "بایرن مونیخ",
        awayFlag: "🔴",
        homeScore: 1,
        awayScore: 1,
        status: "live",
        matchTime: "امشب - ساعت ۲۳:۱۵",
        minute: "۳۴'",
        stadium: "آلیانز آرنا",
        prizePool: "۴۰ میلیون تومان + ۴۰,۰۰۰ سکه",
        heroImage: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80",
        isHot: true,
        predictionsCount: 19800,
      },
      {
        title: "لیگ برتر ایران (هفته ۲۸)",
        league: "لیگ برتر خلیج فارس",
        leagueLogo: "⚽",
        homeTeam: "تراکتور",
        homeFlag: "🔴⚪",
        awayTeam: "سپاهان",
        awayFlag: "🟡🖤",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming",
        matchTime: "جمعه - ساعت ۱۸:۰۰",
        minute: null,
        stadium: "ورزشگاه یادگار امام تبریز",
        prizePool: "۱۵ میلیون تومان",
        heroImage: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
        isHot: false,
        predictionsCount: 14200,
      },
    ]);

    // Seed Quizzes
    await db.insert(quizzes).values([
      {
        title: "کوییز تاکتیکی شهرآورد پایتخت",
        question: "کدام بازیکن بیشترین گل را در تاریخ داربی‌های پایتخت به ثمر رسانده است؟",
        options: ["صفر ایرانپاک (۷ گل)", "غلامحسین مظلومی (۵ گل)", "علی جباری (۵ گل)", "مهدی هاشمی‌نسب (۵ گل)"],
        correctOption: 0,
        difficulty: "متوسط",
        coinReward: 250,
        xpReward: 500,
        category: "تاریخچه شهرآورد",
        timeLimitSeconds: 15,
      },
      {
        title: "چالش اطلاعات لیگ قهرمانان اروپا",
        question: "کدام سرمربی موفق شده ۳ بار پیاپی جام لیگ قهرمانان اروپا را فتح کند؟",
        options: ["زین‌الدین زیدان", "کارلو آنچلوتی", "پپ گواردیولا", "ژوزه مورینیو"],
        correctOption: 0,
        difficulty: "ساده",
        coinReward: 150,
        xpReward: 300,
        category: "فوتبال اروپا",
        timeLimitSeconds: 12,
      },
      {
        title: "فوت‌فن قوانین داوری جدید VAR",
        question: "طبق قوانین جدید فیفا، در صورت آفساید میلمیتری توسط VAR، چه تصمیمی گرفته می‌شود؟",
        options: [
          "تایید آفساید بر اساس خطوط سه‌بعدی خودکار",
          "دادن پوئن به تیم مهاجم",
          "ارزیابی مجدد توسط داور وسط",
          "تکرار صحنه با خط‌کشی دستی",
        ],
        correctOption: 0,
        difficulty: "سخت",
        coinReward: 400,
        xpReward: 800,
        category: "دانش داوری",
        timeLimitSeconds: 20,
      },
    ]);

    // Seed Video Challenges
    await db.insert(videoChallenges).values([
      {
        title: "تحلیل تاکتیکی گل‌های برتر هفته و ماراتن تماشا",
        thumbnail: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        duration: "۰۲:۴۵",
        viewsCount: "۱۲,۴۵۰ بازدید",
        coinReward: 300,
        questionAtSecond: 5,
        question: "در ثانیه ۴ این صحنه، پاس گل توسط کدام پست بازی ساخته شد؟",
        options: ["وینگر راست", "هافبک بازیساز", "مدافع کنار", "مهاجم هدف"],
        correctOption: 1,
      },
      {
        title: "سوپر گل‌های راه دور در تاریخ لیگ برتر ایران",
        thumbnail: "https://images.unsplash.com/photo-1560272564-66952055038b?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        duration: "۰۴:۱۲",
        viewsCount: "۲۸,۹۰۰ بازدید",
        coinReward: 450,
        questionAtSecond: 8,
        question: "سرعت شوت شلیک‌شده در این ویدیو چند کیلومتر بر ساعت تخمین زده شد؟",
        options: ["۱۱۵ کیلومتر بر ساعت", "۹۸ کیلومتر بر ساعت", "۱۳۰ کیلومتر بر ساعت", "۱۰۵ کیلومتر بر ساعت"],
        correctOption: 0,
      },
    ]);

    // Seed User Profile
    await db.insert(userProfiles).values([
      {
        username: "آرش فوتبالی (شما)",
        phoneMasked: "۰۹۱۲***۴۵۸۹",
        avatar: "⚽",
        coins: 2450,
        xp: 4800,
        rank: 7,
        level: 8,
        predictionsCount: 24,
        correctPredictions: 17,
        dailyBonusClaimed: false,
      },
    ]);

    // Seed Leaderboard (with masked phone numbers per specification)
    await db.insert(leaderboard).values([
      {
        rank: 1,
        username: "رضا سلطان پیش‌بینی",
        phoneMasked: "۰۹۱۲***۹۹۰۱",
        points: 12450,
        coins: 38200,
        avatar: "👑",
        badgeTitle: "استاد اعظم",
        badgeColor: "#E8B84B",
        trend: "same",
        period: "weekly",
      },
      {
        rank: 2,
        username: "امیرحسین_تاکتیک",
        phoneMasked: "۰۹۳۵***۸۸۲۳",
        points: 11200,
        coins: 29400,
        avatar: "⚡",
        badgeTitle: "قهرمان هفته",
        badgeColor: "#C9CDD3",
        trend: "up",
        period: "weekly",
      },
      {
        rank: 3,
        username: "سارا_سرخ‌پوش",
        phoneMasked: "۰۹۱۹***۳۳۷۴",
        points: 10850,
        coins: 25100,
        avatar: "🔥",
        badgeTitle: "پیش‌بین طلایی",
        badgeColor: "#C97F4A",
        trend: "down",
        period: "weekly",
      },
      {
        rank: 4,
        username: "مهران_آبی‌دل",
        phoneMasked: "۰۹۱۲***۶۶۱۲",
        points: 9800,
        coins: 19500,
        avatar: "🎯",
        badgeTitle: "خبره فوتبال",
        badgeColor: "#5B7FFF",
        trend: "up",
        period: "weekly",
      },
      {
        rank: 5,
        username: "کیوان_رئالی",
        phoneMasked: "۰۹۳۶***۱۲۸۰",
        points: 9200,
        coins: 17800,
        avatar: "🏆",
        badgeTitle: "حرفه‌ای",
        badgeColor: "#5B7FFF",
        trend: "same",
        period: "weekly",
      },
      {
        rank: 6,
        username: "نوید_کوییزباز",
        phoneMasked: "۰۹۱۸***۹۰۴۴",
        points: 8750,
        coins: 15300,
        avatar: "🧠",
        badgeTitle: "نابغه کوییز",
        badgeColor: "#2ECC71",
        trend: "up",
        period: "weekly",
      },
      {
        rank: 7,
        username: "آرش فوتبالی (شما)",
        phoneMasked: "۰۹۱۲***۴۵۸۹",
        points: 8400,
        coins: 14500,
        avatar: "⚽",
        badgeTitle: "پیش‌بین برتر",
        badgeColor: "#2ECC71",
        trend: "up",
        period: "weekly",
      },
      {
        rank: 8,
        username: "حمید_سپاهانی",
        phoneMasked: "۰۹۱۳***۷۷۱۱",
        points: 7900,
        coins: 12100,
        avatar: "🦁",
        badgeTitle: "فعال باشگاه",
        badgeColor: "#5B7FFF",
        trend: "down",
        period: "weekly",
      },
    ]);

    // Seed Rewards Store
    await db.insert(rewards).values([
      {
        title: "اشتراک ۱ ماهه VIP شبکه ورزش پلاس + پخش ۴K",
        category: "اشتراک دیجیتال",
        coinCost: 1500,
        image: "📺",
        description: "دسترسی به تمامی پخش‌های زنده اختصاصی، بدون تبلیغات و با کیفیت ۴K واقعی همراه با گزارش زنده.",
        stock: 150,
        badge: "پرطرفدارترین",
      },
      {
        title: "پیراهن اصل امضا شده تیم محبوب شما",
        category: "کالای فیزیکی",
        coinCost: 8500,
        image: "👕",
        description: "پیراهن اصلی فصل جدید با امضای بازیکنان به همراه گواهی اصالت فیزیکی.",
        stock: 5,
        badge: "ویژه و محدود",
      },
      {
        title: "توپ رسمی جام ملت‌ها با حک اسم شما",
        category: "کالای اختصاصی",
        coinCost: 5000,
        image: "⚽",
        description: "توپ مسابقه استاندارد فیفا با حک اختصاصی نام کاربری شما در ورزش پلاس.",
        stock: 12,
        badge: "اختصاصی",
      },
      {
        title: "کارت شارژ ۱۰۰,۰۰۰ تومانی سکه باشگاه",
        category: "اعتبار بازی",
        coinCost: 800,
        image: "💳",
        description: "افزایش فوری اعتبار سکه‌های شما برای شرکت در پیش‌بینی‌های بزرگ لیگ برتر.",
        stock: 500,
        badge: "تحویل فوری",
      },
    ]);

    // Seed Chat Messages
    await db.insert(chatMessages).values([
      {
        matchId: 1,
        username: "امیرحسین_تاکتیک",
        phoneMasked: "۰۹۳۵***۸۸۲۳",
        message: "عجب گلی زد استقلال! ترکیب ۴-۳-۳ بالاخره جواب داد 🔥",
        teamBadge: "💙",
        isVip: true,
        timestamp: "۲۰:۴۲",
      },
      {
        matchId: 1,
        username: "سارا_سرخ‌پوش",
        phoneMasked: "۰۹۱۹***۳۳۷۴",
        message: "هنوز وقت زیاده، تعویض‌های نیمه دوم بازی رو برمی‌گردونه 💪❤️",
        teamBadge: "❤️",
        isVip: false,
        timestamp: "۲۰:۴۴",
      },
      {
        matchId: 1,
        username: "رضا سلطان",
        phoneMasked: "۰۹۱۲***۹۹۰۱",
        message: "من پیش‌بینی دقیق رو ۲-۱ زدم، الان دقیقا روی بردم!",
        teamBadge: "⚽",
        isVip: true,
        timestamp: "۲۰:۴۵",
      },
    ]);

    // Seed sample predictions
    await db.insert(predictions).values([
      {
        userId: "1",
        matchId: 1,
        predictedHome: 2,
        predictedAway: 1,
        pointsEarned: 250,
        coinsEarned: 500,
        status: "exact",
      },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
