"use client";

import { useState, useEffect } from "react";

/** نگاشت نام فارسی بازیکن به انگلیسی (TheSportsDB) — ستاره‌ها و اسکوادهای اصلی */
const NAME_MAP: Record<string, string> = {
  // استقلال
  "سیدحسین حسینی": "Hossein Hosseini", "رامین رضاییان": "Ramin Rezaeian", "رافائل سیلوا": "Rafael Silva",
  "ابوالفضل جلالی": "Abolfazl Jalali", "آرمین سهرابیان": "Armin Sohrabian", "آرش رضاوند": "Arash Rezavand",
  "جلال‌الدین ماشاریپوف": "Jaloliddin Masharipov", "دیدیه اندونگ": "Didier Ndong", "مهرداد محمدی": "Mehrdad Mohammadi",
  "گوستاوو بلانکو": "Gustavo Blanco", "آرمان رمضانی": "Arman Ramezani",
  // پرسپولیس
  "الکسیس گندوز": "Alexis Guendouz", "امیررضا رفیعی": "Amirreza Rafiei", "گیورگی گولسیانی": "Giorgi Gulsiani",
  "حسین کنعانی‌زادگان": "Hossein Kanaani-Zadegan", "میلاد محمدی": "Milad Mohammadi", "ایوب العملود": "Ayoub El Amloud",
  "سروش رفیعی": "Soroush Rafiei", "مسعود ریگی": "Masoud Righi", "اوستون اورونوف": "Oston Urunov",
  "علی علیپور": "Ali Alipour", "عیسی آل‌کثیر": "Isa Alekasir", "وحید امیری": "Vahid Amiri", "محمد خدابنده‌لو": "Mohammad Khodabandehloo",
  // سپاهان
  "پیام نیازمند": "Payam Niazmand", "محمد دانشگر": "Mohammad Daneshgar", "امین حزباوی": "Amin Hazbavi",
  "حسین گودرزی": "Hossein Goudarzi", "محمد کریمی": "Mohammad Karimi", "برایان دابو": "Brian Dabo",
  "رضا شکاری": "Reza Shekari", "کاوه رضایی": "Kaveh Rezaei", "مهدی لیموچی": "Mehdi Limouchi", "محمد محبی": "Mohammad Mohebi",
  // تراکتور
  "علیرضا بیرانوند": "Alireza Beiranvand", "مهدی شیری": "Mehdi Shiri", "شجاع خلیل‌زاده": "Shojae Khalilzadeh",
  "عارف آقاسی": "Aref Aghasi", "دانیال اسماعیلی‌فر": "Danial Esmaeilifar", "مهدی ترابی": "Mehdi Torabi",
  "ریکاردو آلوز": "Ricardo Alves", "امیرحسین حسین‌زاده": "Amirhossein Hosseinzadeh", "تومیسلاو اشترکالی": "Tomislav Strkalj",
  // اروپا — ستاره‌ها
  "لیونل مسی": "Lionel Messi", "کیلیان امباپه": "Kylian Mbappe", "ارلینگ هالند": "Erling Haaland",
  "محمد صلاح": "Mohamed Salah", "وینیسیوس جونیور": "Vinicius Junior", "هری کین": "Harry Kane",
  "کای هاورتس": "Kai Havertz", "بوکایو ساکا": "Bukayo Saka", "کول پالمر": "Cole Palmer",
  "الکساندر ایساک": "Alexander Isak", "فیل فودن": "Phil Foden", "جود بلینگام": "Jude Bellingham",
  "کوین دی‌بروینه": "Kevin De Bruyne", "سونی هیونگ-مین": "Son Heung-Min", "مارتین اودگارد": "Martin Odegaard",
  "داوید رایا": "David Raya", "ویلیام سالیبا": "William Saliba", "گابریل ماگال‌هاس": "Gabriel Magalhaes",
  "بن وایت": "Ben White", "دکلان رایس": "Declan Rice", "گابریل ژسوس": "Gabriel Jesus", "لیاندرو تروسارد": "Leandro Trossard",
  "ادرسون مورائس": "Ederson", "کایل واکر": "Kyle Walker", "روبن دیاز": "Ruben Dias", "جان استونز": "John Stones",
  "رودری": "Rodri", "برناردو سیلوا": "Bernardo Silva", "جک گریلیش": "Jack Grealish",
  "آلیسون بکر": "Alisson", "ترنت الکساندر-آرنولد": "Trent Alexander-Arnold", "ویرژیل فن‌دایک": "Virgil van Dijk",
  "اندی رابرتسون": "Andrew Robertson", "الکسیس مک‌آلیستر": "Alexis Mac Allister", "دیوگو ژوتا": "Diogo Jota",
  "لوییز دیاز": "Luis Diaz", "کودی گاکپو": "Cody Gakpo",
  "تیبو کورتوا": "Thibaut Courtois", "سرخیو راموس": "Sergio Ramos", "آشرف حکیمی": "Achraf Hakimi",
  "روبرت لواندوفسکی": "Robert Lewandowski", "لامینه یامال": "Lamine Yamal", "رافینیا": "Raphinha",
  "جولیان آلوارز": "Julian Alvarez", "لوتارو مارتینز": "Lautaro Martinez", "نیکو باریلا": "Nicolo Barella",
  "رافائل لیائو": "Rafael Leao", "ویکتور اوسیمن": "Victor Osimhen", "خویچا کواراتسخلیا": "Khvicha Kvaratskhelia",
  "فلورین ماندل": "Florin Mandea", "دنی اولمو": "Dani Olmo", "پدری": "Pedri", "گاوی": "Gavi",
  "لوکا مودریچ": "Luka Modric", "تونی کروس": "Toni Kroos", "کاسمیرو": "Casemiro",
  "ساکا": "Bukayo Saka", "مایک مانیان": "Mike Maignan", "تر اشتگن": "Marc-Andre ter Stegen",
  "مانوئل نویر": "Manuel Neuer", "یان اوبلاک": "Jan Oblak", "جیانلوئیجی دوناروما": "Gianluigi Donnarumma",
  "امیر عابدزاده": "Amir Abedzadeh", "مهدی طارمی": "Mehdi Taremi", "سردار آزمون": "Sardar Azmoun",
  "کریستیانو رونالدو": "Cristiano Ronaldo", "الکساندر میتروویچ": "Aleksandar Mitrovic", "سادیو مانه": "Sadio Mane",
  "یاسین بونو": "Yassine Bounou", "کالیدو کولیبالی": "Kalidou Koulibaly", "ژوآو کانسلو": "Joao Cancelo",
  "روبن نوس": "Ruben Neves", "سرگئی میلینکوویچ": "Sergej Milinkovic-Savic", "مالکوم": "Malcom",
  "محمد سیماکان": "Mohammed Simakan", "ایمرک لاپورت": "Aymeric Laporte", "مارسلو بروزویچ": "Marcelo Brozovic",
  "اوتاویو": "Otavio",
};

/** hook: عکس بازیکن — TheSportsDB با کش سمت سرور */
export function usePlayerPhoto(nameFa: string | null | undefined) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!nameFa) return;
    const en = NAME_MAP[nameFa];
    if (!en) return; // بدون نگاشت → fallback حروف اول
    let alive = true;
    fetch(`/api/football/player-photo?name=${encodeURIComponent(en)}`)
      .then((r) => r.json())
      .then((res) => { if (alive && res?.photoUrl) setPhotoUrl(res.photoUrl); })
      .catch(() => {});
    return () => { alive = false; };
  }, [nameFa]);
  return photoUrl;
}

export const PLAYER_NAME_MAP = NAME_MAP;
