'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Clock, Calendar, Hourglass, Heart, Moon, Leaf, Shield, Star,
  Sun, CloudRain, Footprints, Wind, Coffee, Droplets, Activity,
  TrendingUp, Award, Gift, Smile
} from 'lucide-react';

// --- CONSTANTS ---
const REFERENCE_DATE = new Date();
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

// --- TYPES ---
interface Metric {
  id: string;
  title: string;
  value: string;
  unit: string;
  gradient: string;
  details: string;
  category: 'time' | 'body' | 'culture' | 'health' | 'fun';
  icon: React.ElementType;
}

interface AgeDetails {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMilliseconds: number;
  ageGroup: '20-30' | '30-40' | '40-50' | '50-60' | '60+' | 'N/A';
}

// --- HELPER FUNCTIONS ---
const calculateAgeDetails = (dobString: string): AgeDetails => {
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) {
    return {
      years: 0, months: 0, days: 0, totalDays: 0, totalMilliseconds: 0, ageGroup: 'N/A'
    };
  }

  const diffMs = REFERENCE_DATE.getTime() - dob.getTime();
  const totalMilliseconds = diffMs;
  const totalDays = Math.floor(diffMs / MS_PER_DAY);

  let years = REFERENCE_DATE.getFullYear() - dob.getFullYear();
  let months = REFERENCE_DATE.getMonth() - dob.getMonth();
  let days = REFERENCE_DATE.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(REFERENCE_DATE.getFullYear(), REFERENCE_DATE.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  let ageGroup: AgeDetails['ageGroup'];
  if (years >= 60) ageGroup = '60+';
  else if (years >= 50) ageGroup = '50-60';
  else if (years >= 40) ageGroup = '40-50';
  else if (years >= 30) ageGroup = '30-40';
  else if (years >= 20) ageGroup = '20-30';
  else ageGroup = 'N/A';

  return { years, months, days, totalDays, totalMilliseconds, ageGroup };
};

const formatNumber = (num: number): string => {
  if (num === 0) return '0';
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) {
    return `${(absNum / 1_000_000_000).toFixed(2)} тэрбум`;
  }
  if (absNum >= 1_000_000) {
    return `${(absNum / 1_000_000).toFixed(2)} сая`;
  }

  return absNum.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const getHealthAdvice = (ageGroup: AgeDetails['ageGroup']): string => {
  switch (ageGroup) {
    case '20-30':
      return `**20-30 нас: Эрчим Хүч ба Тогтвортой Байдал**\n\n- **Стрессийн Менежмент:** Ажлын ачаалал, нийгмийн дарамт нэмэгддэг тул сэтгэлзүйн эрүүл мэнддээ анхаарч, бясалгал, хоббигоор тогтмол хичээллэ.\n- **Хооллолт ба Бодисын Солилцоо:** Бодисын солилцоо хамгийн сайн байдаг ч, түргэн хоол хэрэглэх хандлагатай байдаг. Эслэг ихтэй хүнс, хангалттай уураг хэрэглэж, ирээдүйн эрүүл мэндийн суурийг тавь.\n- **Булчингийн Масс:** Идэвхтэй дасгал хөдөлгөөн хийж, ялангуяа хүч тамирын дасгалаар булчингийн массыг нэмэгдүүлэх нь 30 наснаас хойш удаашрах метаболизмд тустай.\n- **Зөвлөгөө:** Жилд нэг удаа дотор эрхтнүүдийн эхо шинжилгээ, мөн БЗДХ-ын шинжилгээнд тогтмол хамрагдаж байх.`;
    case '30-40':
      return `**30-40 нас: Анхаарал ба Урьдчилан Сэргийлэлт**\n\n- **Бодисын Солилцоо:** Метаболизм 30 наснаас эхлэн жилд 1-2%-аар удааширдаг. Хоолны илчлэгийг нарийн хянаж, долоо хоногт 3-4 удаа эрчимтэй дасгал хийх нь жинг барихад тусална.\n- **Яс ба Үе:** Яс болон үе мөчний элэгдэл эхэлж болзошгүй тул нэмэлт тэжээл (Глюкозамин, Кальци) уух эсэхээ эмчээс асууж, жингээ хяна.\n- **Стресс ба Нойр:** Гэр бүл, ажил хоёрын тэнцвэрийг хангаж, 7-8 цаг тасралтгүй унтаж амрахыг эрмэлз. Урт хугацааны нойрны дутагдал нь даралт ихсэх шалтгаан болдог.\n- **Зөвлөгөө:** Жилд нэг удаа **элэг, бөөрний** үйл ажиллагааг хянах цусны дэлгэрэнгүй шинжилгээ, мөн даралт хэмжигчээр тогтмол хянах.`;
    case '40-50':
      return `**40-50 нас: Дааврын Өөрчлөлт ба Скрининг**\n\n- **Зүрх Судас:** Эрэгтэй, эмэгтэй аль алинд холестерин, триглицеридийн түвшин нэмэгдэж, зүрхний өвчний эрсдэл өснө. Омега-3, эслэгээр баялаг хоол хүнс хэрэглэж, цусан дахь өөхийг бууруулах.\n- **Хараа ба Сонсгол:** Ойрын хараа муудах (presbyopia) болон сонсгол муудах шинж тэмдэг илэрч болзошгүй. Жилд 1-2 удаа нүдний эмчид үзүүлж, нүдний дотоод даралтыг шалгуул.\n- **Даавар:** Эмэгтэйчүүдэд цэвэршилт, эрэгтэйчүүдэд тестостерон буурах (андропауза) үе эхэлдэг. Эмчид хандаж, дааврын түвшингээ шалгуулан зөвлөгөө авах.\n- **Зөвлөгөө:** **Хавдрын скрининг** (Эмэгтэйд Маммограм, Эрэгтэйд түрүү булчирхайн PSA) болон 45 наснаас хойш **бүдүүн гэдэсний дурангийн** урьдчилсан шинжилгээнд хамрагдах.`;
    case '50-60':
      return `**50-60 нас: Хүч Тамир ба Хөдөлгөөний Тэнцвэр**\n\n- **Яс ба Булчингийн Масс:** Булчингийн массыг хадгалах нь хамгийн чухал. Долоо хоногт 2-3 удаа **жинтэй дасгал** (Resistance Training) хийж, уураг, Д аминдэм, Кальцийн хэрэглээг нэмэгдүүлэх.\n- **Боловсруулалт:** Хоол боловсруулах эрхтний үйл ажиллагаа удааширдаг. Ходоодонд хүнд биш, хялбар шингэх, шим тэжээлээр баялаг хоол хүнс сонгох.\n- **Амьсгал ба Уушиг:** Хэрэв та тамхи татдаг бол нэн даруй хаях шаардлагатай. Жил бүрийн томуугийн вакциныг хийлгэж, уушгины эрүүл мэнддээ анхаарах.\n- **Зөвлөгөө:** **Зүрхний цахилгаан бичлэг (ЭКГ)**, холестериний түвшинг хагас жил тутамд хянаж, ясны сийрэгжилтийн шинжилгээ (DXA scan) хийлгэх талаар эмчээс асуух.`;
    case '60+':
      return `**60+ нас: Чанар ба Аюулгүй Байдал**\n\n- **Уналтаас Сэргийлэх:** Тэнцвэр муудаж, унах эрсдэл өндөр байдаг. Тай-Чи (Tai Chi) болон тэнцвэрийн энгийн дасгалуудыг өдөр бүр хийж, гэрийн доторх аюулгүй байдлыг (хивс, гэрэлтүүлэг) ханга.\n- **Шингэн Шигээлт:** Хөгшрөлтийн явцад цангах мэдрэмж буурдаг тул ус бага уух хандлагатай. Энэ нь өтгөн хатах, бөөрөнд ачаалал үгдэг. Цагт нэг удаа ус уухыг зуршил болго.\n- **Ой тогтоолт ба Сэтгэл Зүй:** Ой тогтоолтыг сэргээх дасгалууд (шинэ хэл сурах, ном унших) хийх. Ганцаардлаас сэргийлэхийн тулд нийгмийн идэвхтэй амьдралд (тэтгэвэрийн клуб, найзуудтай уулзах) оролцох.\n- **Зөвлөгөө:** Бүх төрлийн вакцин (хатгаа, томуу, бүслүүр үлд) -ыг хугацаанд нь хийлгэх. Олон төрлийн эм хэрэглэж байгаа бол эмийн тун, харилцан үйлчлэлийг эмчийн хяналтад тогтмол шалгуулж байх.`;
    default:
      return 'Төрсөн огноогоо оруулна уу. Зөвхөн 20-60+ насны бүлгүүдэд зориулсан эрүүл мэндийн зөвлөгөө багтсан.';
  }
};

const getChineseZodiac = (year: number): string => {
  const zodiacs = [
    'Хулгана', 'Үхэр', 'Бар', 'Туулай', 'Луу', 'Могой',
    'Морь', 'Хонь', 'Сармагчин', 'Тахиа', 'Нохой', 'Гахай'
  ];

  const index = (year - 4) % 12;
  return zodiacs[index < 0 ? index + 12 : index];
};

const getWesternZodiac = (month: number, day: number): string => {
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Хумх';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Загас';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Хуц';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Үхэр';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Ихэр';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Мэлхий';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Арслан';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Охин';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Жинлүүр';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Хилэнц';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Нум';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Матар';
  return 'Тодорхойгүй';
};

const getMongolianDayOfWeek = (date: Date): string => {
  const days = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
  return days[date.getDay()];
};

const getSeason = (month: number): string => {
  if (month >= 3 && month <= 5) return 'Хавар';
  if (month >= 6 && month <= 8) return 'Зун';
  if (month >= 9 && month <= 11) return 'Намар';
  return 'Өвөл';
};

const calculateMetrics = (dobString: string): Metric[] => {
  const { years, months, days, totalDays, totalMilliseconds, ageGroup } = calculateAgeDetails(dobString);

  if (ageGroup === 'N/A' || totalDays < 0) {
    return [];
  }

  const minutesLived = Math.floor(totalMilliseconds / MS_PER_MINUTE);
  const hoursLived = Math.floor(totalMilliseconds / MS_PER_HOUR);
  const secondsLived = Math.floor(totalMilliseconds / MS_PER_SECOND);
  const weeksLived = Math.floor(totalDays / 7);

  const AVG_HEART_RATE_BPM = 70;
  const AVG_SLEEP_HOURS_DAY = 8;
  const AVG_CELL_LIVER_RENEWAL_DAYS = 400;
  const AVG_BREATHS_PER_MINUTE = 16;
  const AVG_STEPS_PER_DAY = 7500;
  const AVG_WATER_LITERS_PER_DAY = 2;
  const AVG_COFFEE_CUPS_PER_DAY = 1.5;
  const EARTH_ORBIT_SPEED_KM_S = 30;

  const heartbeats = minutesLived * AVG_HEART_RATE_BPM;
  const sleepHours = totalDays * AVG_SLEEP_HOURS_DAY;
  const sleepDays = Math.floor(sleepHours / 24);
  const liverRenewalCount = totalDays / AVG_CELL_LIVER_RENEWAL_DAYS;
  const breathsTaken = minutesLived * AVG_BREATHS_PER_MINUTE;
  const stepsTaken = totalDays * AVG_STEPS_PER_DAY;
  const waterConsumed = totalDays * AVG_WATER_LITERS_PER_DAY;
  const coffeeConsumed = totalDays * AVG_COFFEE_CUPS_PER_DAY;
  const distanceTraveled = secondsLived * EARTH_ORBIT_SPEED_KM_S;
  const nextBirthday = new Date(REFERENCE_DATE.getFullYear(), new Date(dobString).getMonth(), new Date(dobString).getDate());
  if (nextBirthday < REFERENCE_DATE) {
    nextBirthday.setFullYear(REFERENCE_DATE.getFullYear() + 1);
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - REFERENCE_DATE.getTime()) / MS_PER_DAY);

  const dobDate = new Date(dobString);
  const chineseZodiac = getChineseZodiac(dobDate.getFullYear());
  const westernZodiac = getWesternZodiac(dobDate.getMonth() + 1, dobDate.getDate());
  const dayOfWeekBorn = getMongolianDayOfWeek(dobDate);
  const seasonBorn = getSeason(dobDate.getMonth() + 1);

  const healthAdvice = getHealthAdvice(ageGroup);
  const ageString = `${years} жил ${months} сар ${days} өдөр`;

  return [
    {
      id: 'age',
      title: 'Таны Нас',
      value: ageString,
      unit: '',
      gradient: 'from-blue-500 to-cyan-500',
      details: `Та өнөөдрийг хүртэл яг ${ageString} настай байна. Таны амьдралын үе шат: **${ageGroup}**`,
      category: 'time',
      icon: Clock,
    },
    {
      id: 'days',
      title: 'Амьдарсан Өдөр',
      value: formatNumber(totalDays),
      unit: 'өдөр',
      gradient: 'from-emerald-500 to-teal-500',
      details: `Та төрсөн өдрөөсөө хойш нийт ${formatNumber(totalDays)} өдөр амьдарчээ.`,
      category: 'time',
      icon: Calendar,
    },
    {
      id: 'weeks',
      title: 'Амьдарсан Долоо Хоног',
      value: formatNumber(weeksLived),
      unit: '7 хоног',
      gradient: 'from-violet-500 to-fuchsia-500',
      details: `Та нийт ${formatNumber(weeksLived)} долоо хоног амьдарсан байна.`,
      category: 'time',
      icon: TrendingUp,
    },
    {
      id: 'hours',
      title: 'Амьдарсан Цаг',
      value: formatNumber(hoursLived),
      unit: 'цаг',
      gradient: 'from-amber-500 to-orange-500',
      details: `Та нийт ${formatNumber(hoursLived)} цаг, эсвэл ${formatNumber(minutesLived)} минут амьдарсан байна.`,
      category: 'time',
      icon: Hourglass,
    },
    {
      id: 'birthday',
      title: 'Дараагийн Төрсөн Өдөр',
      value: daysUntilBirthday.toString(),
      unit: 'өдөр',
      gradient: 'from-pink-500 to-rose-500',
      details: `Таны дараагийн төрсөн өдөр хүртэл ${daysUntilBirthday} өдөр үлдлээ!`,
      category: 'fun',
      icon: Gift,
    },
    {
      id: 'heart',
      title: 'Зүрхний Цохилт',
      value: formatNumber(heartbeats),
      unit: 'цохилт',
      gradient: 'from-red-500 to-rose-600',
      details: `Дундаж 70 цохилт/минут гэж тооцвол, таны зүрх нийт ${formatNumber(heartbeats)} удаа цохилсон байна.`,
      category: 'body',
      icon: Heart,
    },
    {
      id: 'breaths',
      title: 'Амьсгал Авсан',
      value: formatNumber(breathsTaken),
      unit: 'удаа',
      gradient: 'from-sky-500 to-blue-600',
      details: `Дундаж 16 амьсгал/минут гэж тооцвол, та ${formatNumber(breathsTaken)} удаа амьсгал авсан байна.`,
      category: 'body',
      icon: Wind,
    },
    {
      id: 'sleep',
      title: 'Унтсан Хугацаа',
      value: formatNumber(sleepDays),
      unit: 'өдөр',
      gradient: 'from-indigo-600 to-blue-700',
      details: `Өдөрт дунджаар 8 цаг унтсан гэж тооцвол, та амьдралынхаа нийт ${formatNumber(sleepHours)} цаг буюу ${formatNumber(sleepDays)} өдрийг унтаж өнгөрүүлжээ.`,
      category: 'body',
      icon: Moon,
    },
    {
      id: 'steps',
      title: 'Алхсан Алхам',
      value: formatNumber(stepsTaken),
      unit: 'алхам',
      gradient: 'from-lime-500 to-green-600',
      details: `Өдөрт дунджаар 7,500 алхам гэж тооцвол, та ${formatNumber(stepsTaken)} алхам алхсан байна. Энэ нь ойролцоогоор ${formatNumber(stepsTaken * 0.0008)} км зай юм!`,
      category: 'fun',
      icon: Footprints,
    },
    {
      id: 'water',
      title: 'Уусан Ус',
      value: formatNumber(waterConsumed),
      unit: 'литр',
      gradient: 'from-cyan-500 to-blue-500',
      details: `Өдөрт дунджаар 2 литр ус уудаг гэж тооцвол, та амьдралдаа нийт ${formatNumber(waterConsumed)} литр ус уусан байна.`,
      category: 'fun',
      icon: Droplets,
    },
    {
      id: 'coffee',
      title: 'Уусан Кофе',
      value: formatNumber(Math.floor(coffeeConsumed)),
      unit: 'аяга',
      gradient: 'from-amber-700 to-yellow-600',
      details: `Өдөрт дунджаар 1.5 аяга кофе уудаг гэж тооцвол, та амьдралдаа ${formatNumber(Math.floor(coffeeConsumed))} аяга кофе уусан байна.`,
      category: 'fun',
      icon: Coffee,
    },
    {
      id: 'space',
      title: 'Дэлхийтэй Аялсан Зай',
      value: formatNumber(distanceTraveled),
      unit: 'км',
      gradient: 'from-slate-700 to-slate-900',
      details: `Дэлхий нарыг тойрон секундэд 30 км хурдтай эргэдэг. Та төрсөн цагаасаа хойш Дэлхийтэй хамт ${formatNumber(distanceTraveled)} км зай туулсан байна!`,
      category: 'fun',
      icon: Award,
    },
    {
      id: 'renewal',
      title: 'Элэг Шинэчлэгдсэн',
      value: liverRenewalCount.toFixed(2),
      unit: 'удаа',
      gradient: 'from-teal-500 to-emerald-600',
      details: `Элэгний эс ойролцоогоор 400 хоногт шинэчлэгддэг гэж үзвэл, таны элэг ${liverRenewalCount.toFixed(1)} удаа бүтэн шинэчлэгдсэн байна.`,
      category: 'body',
      icon: Leaf,
    },
    {
      id: 'health',
      title: `Насны Зөвлөгөө`,
      value: ageGroup,
      unit: 'нас',
      gradient: 'from-rose-500 to-pink-600',
      details: healthAdvice,
      category: 'health',
      icon: Shield,
    },
    {
      id: 'zodiac',
      title: 'Зурхай',
      value: `${chineseZodiac}`,
      unit: westernZodiac,
      gradient: 'from-yellow-500 to-amber-500',
      details: `Та **${chineseZodiac}** жилтэй. Өрнийн зурхайн орд нь **${westernZodiac}**. Та долоо хоногийн **${dayOfWeekBorn}** гарагт, **${seasonBorn}** улиралд төрсөн.`,
      category: 'culture',
      icon: Star,
    },
    {
      id: 'smile',
      title: 'Инээмсэглэсэн',
      value: formatNumber(Math.floor(totalDays * 20)),
      unit: 'удаа',
      gradient: 'from-yellow-400 to-orange-500',
      details: `Хүн өдөрт дунджаар 20 удаа инээмсэглэдэг гэж тооцвол, та амьдралдаа ${formatNumber(Math.floor(totalDays * 20))} удаа инээмсэглэсэн байна!`,
      category: 'fun',
      icon: Smile,
    },
  ];
};

// --- COMPONENTS ---
const MetricCard: React.FC<{ metric: Metric; onClick: (metric: Metric) => void; isDark: boolean }> = ({ metric, onClick, isDark }) => {
  const IconComponent = metric.icon;

  return (
    <button
      className={`p-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-left flex flex-col justify-between h-32 bg-gradient-to-br ${metric.gradient} relative overflow-hidden group`}
      onClick={() => onClick(metric)}
      aria-label={`${metric.title} дэлгэрэнгүй`}
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <div className="flex items-start justify-between mb-2 relative z-10">
        <h3 className="text-xs font-semibold text-white/90">{metric.title}</h3>
        <IconComponent className="w-5 h-5 text-white/80" />
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-bold text-white truncate">{metric.value}</p>
        <p className="text-xs font-medium text-white/80 mt-0.5">{metric.unit}</p>
      </div>
    </button>
  );
};

const DetailModal: React.FC<{ metric: Metric | null; onClose: () => void; isDark: boolean }> = ({ metric, onClose, isDark }) => {
  if (!metric) return null;

  const formattedDetails = metric.details
    .split('\n')
    .map((line, index) => {
      if (line.startsWith('-')) {
        return <li key={index} className={`ml-5 list-disc mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{line.substring(1).trim()}</li>;
      }
      if (line.startsWith('**')) {
        const parts = line.split('**');
        if (parts.length >= 4) {
          return <p key={index} className={`mt-3 font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{parts[1].trim()}: <span className={`font-normal ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{parts[3]?.trim()}</span></p>;
        }
        if (parts.length === 3) {
          return <p key={index} className={`mt-4 text-lg font-bold ${isDark ? 'text-white border-gray-700' : 'text-gray-900 border-gray-300'} border-b pb-1`}>{parts[1].trim()}</p>;
        }
      }
      return <p key={index} className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>{line}</p>;
    });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden transform transition-all duration-300 animate-slide-up`}>
        <div className={`p-6 bg-gradient-to-br ${metric.gradient} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{metric.title}</h2>
              <p className="mt-2 text-3xl font-extrabold">{metric.value}</p>
              <p className="text-sm font-medium opacity-90">{metric.unit}</p>
            </div>
            <metric.icon className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Дэлгэрэнгүй:</h3>
          <div className="text-sm space-y-2">
            {formattedDetails}
          </div>
          <button
            onClick={onClose}
            className={`mt-6 w-full py-3 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold rounded-xl transition-colors duration-200`}
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [dobInput, setDobInput] = useState<string>('');
  const [activeMetric, setActiveMetric] = useState<Metric | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const metrics = useMemo(() => {
    if (!dobInput) return [];
    try {
      setErrorMessage('');
      return calculateMetrics(dobInput);
    } catch (error) {
      setErrorMessage('Төрсөн огноо буруу байна.');
      return [];
    }
  }, [dobInput]);

  const filteredMetrics = useMemo(() => {
    if (activeCategory === 'all') return metrics;
    return metrics.filter(m => m.category === activeCategory);
  }, [metrics, activeCategory]);

  const handleCardClick = useCallback((metric: Metric) => {
    setActiveMetric(metric);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveMetric(null);
  }, []);

  const categories = [
    { id: 'all', label: 'Бүгд', icon: Activity },
    { id: 'time', label: 'Цаг хугацаа', icon: Clock },
    { id: 'body', label: 'Бие', icon: Heart },
    { id: 'culture', label: 'Соёл', icon: Star },
    { id: 'health', label: 'Эрүүл мэнд', icon: Shield },
    { id: 'fun', label: 'Сонирхолтой', icon: Smile },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-6xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Амьдралын Тооцоолуур
            </h1>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`ml-4 p-2.5 rounded-xl transition-all duration-300 ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Таны төрсөн огноог ашиглан амьдралын сонирхолтой мэдээллүүдийг харуулна
          </p>
        </header>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-5 sm:p-6 rounded-2xl shadow-xl mb-8`}>
          <label htmlFor="dob" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Төрсөн Огноо:
          </label>
          <input
            id="dob"
            type="date"
            value={dobInput}
            onChange={(e) => setDobInput(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl transition-colors duration-200 ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
            }`}
            max={new Date().toISOString().split('T')[0]}
          />
          {errorMessage && (
            <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
          )}
        </div>

        {metrics.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeCategory === cat.id
                      ? isDark
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-500 text-white shadow-lg'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} onClick={handleCardClick} isDark={isDark} />
              ))}
            </div>

            <p className={`mt-8 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} pt-4 text-center`}>
              Бүх тооцооллууд дундаж статистикт суурилсан ба ойролцоо үзүүлэлт юм.
            </p>
          </>
        )}

        <DetailModal metric={activeMetric} onClose={handleCloseModal} isDark={isDark} />
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
