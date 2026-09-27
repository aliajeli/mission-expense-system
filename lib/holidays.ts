import { d2j, j2d, jalaliWeekDay, parseKey, toKey } from './jalali';

/** تعطیلات ثابت خورشیدی (هر سال تکرار می‌شوند) */
const FIXED: Record<string, string> = {
  '01-01': 'جشن نوروز',
  '01-02': 'عید نوروز',
  '01-03': 'عید نوروز',
  '01-04': 'عید نوروز',
  '01-12': 'روز جمهوری اسلامی ایران',
  '01-13': 'روز طبیعت (سیزده به در)',
  '03-14': 'رحلت امام خمینی',
  '03-15': 'قیام ۱۵ خرداد',
  '11-22': 'پیروزی انقلاب اسلامی',
  '12-29': 'ملی شدن صنعت نفت',
};

/** تعطیلات قمری/متغیر - بر اساس تقویم رسمی هر سال */
const VARIABLE: Record<number, Record<string, string>> = {
  1404: {
    '01-11': 'عید سعید فطر',
    '02-04': 'شهادت امام جعفر صادق (ع)',
    '03-16': 'عید سعید قربان',
    '03-24': 'عید سعید غدیر خم',
    '04-14': 'تاسوعای حسینی',
    '04-15': 'عاشورای حسینی',
    '05-23': 'اربعین حسینی',
    '05-31': 'رحلت رسول اکرم (ص) و شهادت امام حسن مجتبی (ع)',
    '06-02': 'شهادت امام رضا (ع)',
    '06-10': 'شهادت امام حسن عسکری (ع)',
    '06-19': 'میلاد رسول اکرم (ص) و امام جعفر صادق (ع)',
    '09-03': 'شهادت حضرت فاطمه زهرا (س)',
    '10-13': 'ولادت امام علی (ع) - روز پدر',
    '10-27': 'مبعث رسول اکرم (ص)',
    '11-15': 'ولادت حضرت قائم (عج) - نیمه شعبان',
    '12-20': 'شهادت حضرت علی (ع)',
  },
  1405: {
    '01-25': 'شهادت امام جعفر صادق (ع)',
    '03-06': 'عید سعید قربان',
    '03-14': 'عید سعید غدیر خم',
    '04-03': 'تاسوعای حسینی',
    '04-04': 'عاشورای حسینی',
    '05-13': 'اربعین حسینی',
    '05-21': 'رحلت رسول اکرم (ص) و شهادت امام حسن مجتبی (ع)',
    '05-22': 'شهادت امام رضا (ع)',
    '05-30': 'شهادت امام حسن عسکری (ع)',
    '06-08': 'میلاد رسول اکرم (ص) و امام جعفر صادق (ع)',
    '08-22': 'شهادت حضرت فاطمه زهرا (س)',
    '10-02': 'ولادت امام علی (ع) - روز پدر',
    '10-16': 'مبعث رسول اکرم (ص)',
    '11-04': 'ولادت حضرت قائم (عج) - نیمه شعبان',
    '12-09': 'شهادت حضرت علی (ع)',
    '12-19': 'عید سعید فطر',
    '12-20': 'تعطیل به مناسبت عید سعید فطر',
  },
  1406: {
    '01-14': 'شهادت امام جعفر صادق (ع)',
    '02-27': 'عید سعید قربان',
    '03-04': 'عید سعید غدیر خم',
    '03-25': 'تاسوعای حسینی',
    '03-26': 'عاشورای حسینی',
    '05-03': 'اربعین حسینی',
    '05-11': 'رحلت رسول اکرم (ص) و شهادت امام حسن مجتبی (ع)',
    '05-12': 'شهادت امام رضا (ع)',
    '05-20': 'شهادت امام حسن عسکری (ع)',
    '05-29': 'میلاد رسول اکرم (ص) و امام جعفر صادق (ع)',
    '08-12': 'شهادت حضرت فاطمه زهرا (س)',
    '09-21': 'ولادت امام علی (ع) - روز پدر',
    '10-05': 'مبعث رسول اکرم (ص)',
    '10-23': 'ولادت حضرت قائم (عج) - نیمه شعبان',
    '11-29': 'شهادت حضرت علی (ع)',
    '12-08': 'عید سعید فطر',
    '12-09': 'تعطیل به مناسبت عید سعید فطر',
  },
};

export interface HolidayInfo {
  holiday: boolean;
  title: string;
  weekend: boolean;
}

/**
 * وضعیت تعطیلی یک روز
 * @param custom تعطیلات دستی تعریف‌شده توسط کاربر در تنظیمات
 * @param thursdayOff آیا پنج‌شنبه هم تعطیل محسوب شود
 */
export function getHolidayInfo(
  key: string,
  custom: Record<string, string> = {},
  thursdayOff = false,
): HolidayInfo {
  const d = parseKey(key);
  if (!d) return { holiday: false, title: '', weekend: false };
  const md = `${String(d.jm).padStart(2, '0')}-${String(d.jd).padStart(2, '0')}`;
  const wd = jalaliWeekDay(d.jy, d.jm, d.jd);
  const titles: string[] = [];

  if (custom[key]) titles.push(custom[key]);
  if (VARIABLE[d.jy]?.[md]) titles.push(VARIABLE[d.jy][md]);
  if (FIXED[md]) titles.push(FIXED[md]);

  const weekend = wd === 6 || (thursdayOff && wd === 5);
  if (weekend && !titles.length) titles.push(wd === 6 ? 'جمعه' : 'پنج‌شنبه');

  return { holiday: titles.length > 0 || weekend, title: titles.join(' / '), weekend };
}

/** شمارش روزهای تعطیل در یک بازه */
export function countHolidays(
  startKey: string,
  endKey: string,
  custom: Record<string, string> = {},
  thursdayOff = false,
) {
  const s = parseKey(startKey);
  const e = parseKey(endKey);
  if (!s || !e) return 0;
  let count = 0;
  const from = j2d(s.jy, s.jm, s.jd);
  const to = j2d(e.jy, e.jm, e.jd);
  for (let i = from; i <= to; i += 1) {
    const dt = d2j(i);
    if (getHolidayInfo(toKey(dt.jy, dt.jm, dt.jd), custom, thursdayOff).holiday) count += 1;
  }
  return count;
}

export const SUPPORTED_YEARS = Object.keys(VARIABLE).map(Number);
