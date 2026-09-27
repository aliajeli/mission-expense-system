'use client';

import { Totals } from '@/lib/filters';
import { formatMoney, toFaDigits } from '@/lib/format';

export default function StatusDonut({ totals, currency }: { totals: Totals; currency: string }) {
  const items = [
    { label: 'انجام شده', value: totals.done, color: 'var(--done)', count: totals.count.done },
    { label: 'بارگذاری شده', value: totals.uploaded, color: 'var(--uploaded)', count: totals.count.uploaded },
    { label: 'پرداخت شده', value: totals.paid, color: 'var(--paid)', count: totals.count.paid },
  ];
  const sum = items.reduce((a, b) => a + b.value, 0) || 1;
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ flex: 'none' }}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="16" />
        {items.map((it) => {
          const len = (it.value / sum) * C;
          const el = (
            <circle
              key={it.label}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={it.color}
              strokeWidth="16"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
        <text
          x="70"
          y="66"
          textAnchor="middle"
          fontSize="11"
          fill="var(--text-mute)"
          fontFamily="Vazirmatn"
        >
          جمع کل
        </text>
        <text
          x="70"
          y="86"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="var(--text)"
          fontFamily="Vazirmatn"
        >
          {formatMoney(totals.all)}
        </text>
      </svg>

      <div className="donut-legend">
        {items.map((it) => (
          <div className="legend-row" key={it.label}>
            <span className="sw" style={{ background: it.color }} />
            <span>{it.label}</span>
            <span className="muted">({toFaDigits(it.count)})</span>
            <span className="val num">
              {formatMoney(it.value)} <span className="muted">{currency}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
