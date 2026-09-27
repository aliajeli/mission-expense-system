'use client';

import { Totals } from '@/lib/filters';
import { formatMoney, toFaDigits } from '@/lib/format';

const CARDS: {
  key: keyof Pick<Totals, 'done' | 'uploaded' | 'paid' | 'receivable'>;
  label: string;
  color: string;
  meta: (t: Totals) => string;
}[] = [
  {
    key: 'done',
    label: 'هزینه انجام شده',
    color: 'var(--done)',
    meta: (t) => `${toFaDigits(t.count.done)} ماموریت در انتظار ثبت در EPM`,
  },
  {
    key: 'uploaded',
    label: 'هزینه بارگذاری شده',
    color: 'var(--uploaded)',
    meta: (t) => `${toFaDigits(t.count.uploaded)} ماموریت ثبت‌شده در EPM`,
  },
  {
    key: 'paid',
    label: 'هزینه پرداخت شده',
    color: 'var(--paid)',
    meta: (t) => `${toFaDigits(t.count.paid)} ماموریت تسویه شده`,
  },
  {
    key: 'receivable',
    label: 'مجموع طلب از شرکت',
    color: 'var(--primary)',
    meta: () => 'انجام شده + بارگذاری شده',
  },
];

export default function StatCards({ totals, currency }: { totals: Totals; currency: string }) {
  return (
    <div className="grid grid-4">
      {CARDS.map((c) => (
        <div className="card stat" key={c.key} style={{ ['--accent' as string]: c.color }}>
          <span className="label">
            <span className="dot" style={{ background: c.color }} />
            {c.label}
          </span>
          <span className="value num" style={{ color: c.color }}>
            {formatMoney(totals[c.key])}
            <span className="unit">{currency}</span>
          </span>
          <span className="meta">{c.meta(totals)}</span>
        </div>
      ))}
    </div>
  );
}
