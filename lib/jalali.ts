import { toFaDigits } from './format';

/**
 * تبدیل تاریخ شمسی (هجری خورشیدی) و میلادی - بدون وابستگی خارجی
 * پیاده‌سازی بر پایه الگوریتم استاندارد تقویم جلالی
 */

export interface JDate {
  jy: number;
  jm: number;
  jd: number;
}

const breaks = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 1701, 1866, 2020, 2453, 3172,
];

function div(a: number, b: number) {
  return ~~(a / b);
}
function mod(a: number, b: number) {
  return a - ~~(a / b) * b;
}

function jalCal(jy: number) {
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jump = 0;

  for (let i = 1; i < bl; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;

  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

export function isLeapJalaliYear(jy: number) {
  return jalCal(jy).leap === 0;
}

export function jalaliMonthLength(jy: number, jm: number) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaliYear(jy) ? 30 : 29;
}

/** تبدیل تاریخ میلادی به شماره روز جولیَن */
export function g2d(gy: number, gm: number, gd: number) {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

export function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

export function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

export function d2j(jdn: number): JDate {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;

  if (k >= 0) {
    if (k <= 185) {
      const jm = 1 + div(k, 31);
      const jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (jalCal(jy).leap === 1) k += 1;
  }
  const jm = 7 + div(k, 30);
  const jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

export function toJalali(date: Date): JDate {
  return d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()));
}

export function toGregorian(jy: number, jm: number, jd: number): Date {
  const g = d2g(j2d(jy, jm, jd));
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function todayJalali(): JDate {
  return toJalali(new Date());
}

/** شماره روز هفته: ۰ = شنبه ... ۶ = جمعه */
export function jalaliWeekDay(jy: number, jm: number, jd: number) {
  const g = toGregorian(jy, jm, jd);
  return (g.getDay() + 1) % 7;
}

export const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
export const WEEK_DAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/** قالب ذخیره‌سازی داخلی: YYYY-MM-DD شمسی */
export function toKey(jy: number, jm: number, jd: number) {
  return `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`;
}

export function parseKey(key: string): JDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
  if (!m) return null;
  return { jy: +m[1], jm: +m[2], jd: +m[3] };
}

/** قالب فشرده برای نام پوشه: 14050705 */
export function toCompact(key: string) {
  const d = parseKey(key);
  if (!d) return '';
  return `${d.jy}${String(d.jm).padStart(2, '0')}${String(d.jd).padStart(2, '0')}`;
}

export function keyToDayNumber(key: string) {
  const d = parseKey(key);
  if (!d) return 0;
  return j2d(d.jy, d.jm, d.jd);
}

/** تعداد روز ماموریت (شامل روز شروع و پایان) */
export function daysBetween(startKey: string, endKey: string) {
  const a = keyToDayNumber(startKey);
  const b = keyToDayNumber(endKey);
  if (!a || !b) return 0;
  return b - a + 1;
}

export function formatJalali(key: string, withWeekDay = false) {
  const d = parseKey(key);
  if (!d) return '—';
  const base = `${toFaDigits(d.jd)} ${MONTHS[d.jm - 1]} ${toFaDigits(d.jy)}`;
  if (!withWeekDay) return base;
  return `${WEEK_DAYS[jalaliWeekDay(d.jy, d.jm, d.jd)]} ${base}`;
}

export function formatJalaliShort(key: string) {
  const d = parseKey(key);
  if (!d) return '—';
  return toFaDigits(`${d.jy}/${String(d.jm).padStart(2, '0')}/${String(d.jd).padStart(2, '0')}`);
}

/** قالب عددی لاتین برای خروجی‌های داده‌ای (CSV) */
export function formatJalaliPlain(key: string) {
  const d = parseKey(key);
  if (!d) return '';
  return `${d.jy}/${String(d.jm).padStart(2, '0')}/${String(d.jd).padStart(2, '0')}`;
}

export function addMonths(jy: number, jm: number, delta: number) {
  let y = jy;
  let m = jm + delta;
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  return { jy: y, jm: m };
}
