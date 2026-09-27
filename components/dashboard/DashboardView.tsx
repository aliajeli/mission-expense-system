'use client';

import { useMemo } from 'react';
import Card from '@/components/ui/Card';
import StatCards from './StatCards';
import StatusDonut from './StatusDonut';
import BarList from './BarList';
import StatusBadge from '@/components/ui/StatusBadge';
import Empty from '@/components/ui/Empty';
import { useApp } from '@/providers/AppProvider';
import { computeTotals, groupByBranch, groupByMonth } from '@/lib/filters';
import { missionTotal } from '@/lib/types';
import { MONTHS, daysBetween, formatJalaliShort } from '@/lib/jalali';
import { formatMoney, toFaDigits } from '@/lib/format';

export default function DashboardView({ onNew }: { onNew: () => void }) {
  const { missions, settings } = useApp();
  const totals = useMemo(() => computeTotals(missions), [missions]);
  const branches = useMemo(() => groupByBranch(missions), [missions]);
  const months = useMemo(() => groupByMonth(missions), [missions]);
  const recent = useMemo(
    () => [...missions].sort((a, b) => (a.startDate < b.startDate ? 1 : -1)).slice(0, 6),
    [missions],
  );

  if (!missions.length) {
    return (
      <Card>
        <Empty
          title="هنوز ماموریتی ثبت نشده است"
          desc="برای شروع، اولین ماموریت خود را ثبت کنید تا آمار هزینه‌ها نمایش داده شود."
          action={
            <button className="btn btn-primary" onClick={onNew}>
              ثبت ماموریت جدید
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="page-section">
      <StatCards totals={totals} currency={settings.currency} />

      <div className="grid grid-2">
        <Card title="تفکیک مالی" hint="بر اساس وضعیت">
          <StatusDonut totals={totals} currency={settings.currency} />
          <div className="divider" style={{ margin: '16px 0 8px' }} />
          <div className="kv">
            <span className="k">مجموع طلب از شرکت (پرداخت‌نشده)</span>
            <span className="v num txt-uploaded">
              {formatMoney(totals.receivable)} {settings.currency}
            </span>
          </div>
          <div className="kv">
            <span className="k">مجموع پرداخت‌شده توسط شرکت</span>
            <span className="v num txt-paid">
              {formatMoney(totals.paid)} {settings.currency}
            </span>
          </div>
          <div className="kv">
            <span className="k">مجموع کل هزینه ماموریت‌ها</span>
            <span className="v num">
              {formatMoney(totals.all)} {settings.currency}
            </span>
          </div>
        </Card>

        <Card title="هزینه به تفکیک شعبه">
          <BarList
            currency={settings.currency}
            items={branches.slice(0, 6).map((b) => ({
              label: b.branch,
              value: b.total,
              meta: `${toFaDigits(b.count)} ماموریت`,
            }))}
          />
          <div className="divider" style={{ margin: '16px 0' }} />
          <h4 style={{ fontSize: 13, marginBottom: 12 }}>روند ماهانه (۶ ماه اخیر)</h4>
          <BarList
            currency={settings.currency}
            items={months.map(([key, value]) => ({
              label: `${MONTHS[+key.slice(5, 7) - 1]} ${toFaDigits(key.slice(0, 4))}`,
              value,
              color: 'linear-gradient(90deg,#0ea5e9,#22c55e)',
            }))}
          />
        </Card>
      </div>

      <Card title="آخرین ماموریت‌ها" bodyClass="">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>شعبه</th>
                <th>موضوع</th>
                <th>بازه</th>
                <th>روز</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((m) => (
                <tr key={m.id}>
                  <td className="nowrap">{m.branch}</td>
                  <td>{m.subject}</td>
                  <td className="num nowrap">
                    {formatJalaliShort(m.startDate)} — {formatJalaliShort(m.endDate)}
                  </td>
                  <td className="num">{toFaDigits(daysBetween(m.startDate, m.endDate))}</td>
                  <td className="num strong">
                    {formatMoney(missionTotal(m))} <span className="muted">{settings.currency}</span>
                  </td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
