'use client';

import { formatMoney, toFaDigits } from '@/lib/format';

export interface BarItem {
  label: string;
  value: number;
  meta?: string;
  color?: string;
}

export default function BarList({ items, currency }: { items: BarItem[]; currency: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  if (!items.length) return <p className="muted">داده‌ای برای نمایش وجود ندارد.</p>;
  return (
    <div className="bars">
      {items.map((it) => (
        <div className="bar-row" key={it.label}>
          <div className="bar-top">
            <span>
              {it.label} {it.meta ? <span className="muted">({it.meta})</span> : null}
            </span>
            <span className="num">
              {formatMoney(it.value)} <span className="muted">{currency}</span>
            </span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${Math.max((it.value / max) * 100, 2)}%`,
                background: it.color || 'linear-gradient(90deg,#3b5bfd,#7c3aed)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function toFa(n: number) {
  return toFaDigits(n);
}
