const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[+d]);
}

/** تبدیل ارقام فارسی/عربی به انگلیسی */
export function toEnDigits(value: string) {
  return String(value)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function parseMoney(input: string) {
  const clean = toEnDigits(input).replace(/[^\d-]/g, '');
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(value: number, withDigits = true) {
  const n = Math.round(value || 0);
  const s = n.toLocaleString('en-US');
  return withDigits ? toFaDigits(s) : s;
}

export function formatMoneyWithUnit(value: number, currency = 'تومان') {
  return `${formatMoney(value)} ${currency}`;
}

export function formatBytes(bytes: number) {
  if (!bytes) return '۰';
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${toFaDigits((bytes / 1024 ** i).toFixed(i ? 1 : 0))} ${units[i]}`;
}

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
