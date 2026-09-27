'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  MONTHS,
  WEEK_DAYS_SHORT,
  addMonths,
  formatJalali,
  jalaliMonthLength,
  jalaliWeekDay,
  parseKey,
  toKey,
  todayJalali,
} from '@/lib/jalali';
import { getHolidayInfo } from '@/lib/holidays';
import { toFaDigits } from '@/lib/format';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@/components/ui/Icons';

interface Props {
  value: string;
  onChange: (key: string) => void;
  customHolidays?: Record<string, string>;
  thursdayOff?: boolean;
  minKey?: string;
  placeholder?: string;
  clearable?: boolean;
}

const POP_W = 290;
const POP_H = 330;

export default function JalaliDatePicker({
  value,
  onChange,
  customHolidays = {},
  thursdayOff = false,
  minKey,
  placeholder = 'انتخاب تاریخ',
  clearable = true,
}: Props) {
  const today = useMemo(() => todayJalali(), []);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [view, setView] = useState(() => {
    const p = parseKey(value);
    return p ? { jy: p.jy, jm: p.jm } : { jy: today.jy, jm: today.jm };
  });
  const anchor = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const p = parseKey(value);
    if (p) setView({ jy: p.jy, jm: p.jm });
  }, [value]);

  const place = useCallback(() => {
    const el = anchor.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.right - POP_W, window.innerWidth - POP_W - 8));
    const below = r.bottom + 6;
    const top = below + POP_H > window.innerHeight ? Math.max(8, r.top - POP_H - 6) : below;
    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchor.current?.contains(t) || pop.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = () => place();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, place]);

  const days = useMemo(() => {
    const len = jalaliMonthLength(view.jy, view.jm);
    const lead = jalaliWeekDay(view.jy, view.jm, 1);
    const cells: (number | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= len; d += 1) cells.push(d);
    return cells;
  }, [view]);

  const years = useMemo(
    () => Array.from({ length: 11 }, (_, i) => today.jy - 5 + i),
    [today.jy],
  );

  const todayKey = toKey(today.jy, today.jm, today.jd);

  const popup = (
    <div
      className="dp-pop"
      ref={pop}
      dir="rtl"
      style={{ top: pos.top, left: pos.left, width: POP_W }}
    >
      <div className="dp-head">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => setView(addMonths(view.jy, view.jm, -1))}
          aria-label="ماه قبل"
        >
          <IconChevronRight size={15} />
        </button>
        <div className="dp-title">
          <select
            value={view.jm}
            onChange={(e) => setView({ ...view, jm: +e.target.value })}
            aria-label="ماه"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={view.jy}
            onChange={(e) => setView({ ...view, jy: +e.target.value })}
            aria-label="سال"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {toFaDigits(y)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => setView(addMonths(view.jy, view.jm, 1))}
          aria-label="ماه بعد"
        >
          <IconChevronLeft size={15} />
        </button>
      </div>

      <div className="dp-grid">
        {WEEK_DAYS_SHORT.map((w, i) => (
          <div key={i} className="dp-wd">
            {w}
          </div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const key = toKey(view.jy, view.jm, d);
          const info = getHolidayInfo(key, customHolidays, thursdayOff);
          const disabled = !!minKey && key < minKey;
          const cls = [
            'dp-day',
            info.holiday ? 'holiday' : '',
            key === todayKey ? 'today' : '',
            key === value ? 'selected' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              type="button"
              key={key}
              className={cls}
              disabled={disabled}
              title={info.title}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
            >
              {toFaDigits(d)}
            </button>
          );
        })}
      </div>

      <div className="dp-foot">
        <span className="dp-legend">
          <i /> تعطیل رسمی
        </span>
        <span className="flex center gap-6">
          {clearable && value ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              پاک کردن
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              onChange(todayKey);
              setOpen(false);
            }}
          >
            امروز
          </button>
        </span>
      </div>
    </div>
  );

  return (
    <div className="datepicker" ref={anchor}>
      <div className="input dp-input" onClick={() => setOpen((o) => !o)} role="button" tabIndex={0}>
        <span className={value ? '' : 'ph'}>{value ? formatJalali(value, true) : placeholder}</span>
        <IconCalendar size={16} />
      </div>
      {open && mounted ? createPortal(popup, document.body) : null}
    </div>
  );
}
