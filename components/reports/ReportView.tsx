'use client';

import { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Empty from '@/components/ui/Empty';
import StatusBadge from '@/components/ui/StatusBadge';
import JalaliDatePicker from '@/components/date/JalaliDatePicker';
import { Field, Switch } from '@/components/ui/Field';
import { useApp } from '@/providers/AppProvider';
import { computeTotals, filterMissions } from '@/lib/filters';
import { MissionStatus, STATUS_LABEL, STATUS_ORDER, missionTotal, transportTotal } from '@/lib/types';
import { daysBetween, formatJalali, formatJalaliShort, todayJalali, toKey } from '@/lib/jalali';
import { formatMoney, toFaDigits } from '@/lib/format';
import { getApi } from '@/lib/bridge';
import { IconDownload, IconPrint } from '@/components/ui/Icons';

export default function ReportView() {
  const { missions, settings, exportText } = useApp();
  const today = todayJalali();
  const [from, setFrom] = useState(toKey(today.jy, 1, 1));
  const [to, setTo] = useState(toKey(today.jy, today.jm, today.jd));
  const [branch, setBranch] = useState('all');
  const [status, setStatus] = useState<MissionStatus | 'all'>('all');
  const [withCosts, setWithCosts] = useState(true);

  const list = useMemo(
    () => filterMissions(missions, { from, to, branch, status }).slice().reverse(),
    [missions, from, to, branch, status],
  );
  const totals = useMemo(() => computeTotals(list), [list]);
  const daysSum = list.reduce((a, m) => a + daysBetween(m.startDate, m.endDate), 0);

  const csv = () => {
    const head = withCosts
      ? ['ردیف', 'شعبه', 'موضوع', 'تاریخ شروع', 'تاریخ پایان', 'تعداد روز', 'ایاب و ذهاب', 'غذا', 'جمع', 'وضعیت', 'کد EPM ایاب و ذهاب', 'کد EPM غذا']
      : ['ردیف', 'شعبه', 'موضوع', 'تاریخ شروع', 'تاریخ پایان', 'تعداد روز', 'وضعیت'];
    const rows = list.map((m, i) => {
      const common = [
        i + 1,
        m.branch,
        m.subject,
        formatJalaliShort(m.startDate),
        formatJalaliShort(m.endDate),
        daysBetween(m.startDate, m.endDate),
      ];
      return withCosts
        ? [...common, transportTotal(m), m.costFood, missionTotal(m), STATUS_LABEL[m.status], m.epmTransportCode, m.epmFoodCode]
        : [...common, STATUS_LABEL[m.status]];
    });
    const body = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    exportText(`گزارش-ماموریت-${formatJalaliShort(from)}-تا-${formatJalaliShort(to)}.csv`, body, 'csv');
  };

  return (
    <div className="page-section">
      <Card title="گزارش ماموریت‌ها" hint="در بازه زمانی دلخواه" className="no-print">
        <div className="grid grid-4">
          <Field label="از تاریخ">
            <JalaliDatePicker
              value={from}
              onChange={setFrom}
              customHolidays={settings.customHolidays}
              thursdayOff={settings.thursdayOff}
              clearable={false}
            />
          </Field>
          <Field label="تا تاریخ">
            <JalaliDatePicker
              value={to}
              onChange={setTo}
              customHolidays={settings.customHolidays}
              thursdayOff={settings.thursdayOff}
              clearable={false}
            />
          </Field>
          <Field label="شعبه">
            <select className="select" value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="all">همه شعب</option>
              {settings.branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="وضعیت">
            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as MissionStatus | 'all')}
            >
              <option value="all">همه وضعیت‌ها</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="divider" style={{ margin: '14px 0' }} />

        <div className="toolbar">
          <Switch checked={withCosts} onChange={setWithCosts} label="نمایش هزینه‌ها در گزارش" />
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={csv} disabled={!list.length}>
            <IconDownload size={15} /> خروجی CSV
          </button>
          <button className="btn btn-primary" onClick={() => getApi().print()} disabled={!list.length}>
            <IconPrint size={15} /> چاپ / PDF
          </button>
        </div>
      </Card>

      <Card bodyClass="card-body">
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16 }}>گزارش ماموریت‌های اداری</h2>
          <p className="muted" style={{ fontSize: 12.5 }}>
            {settings.companyName ? `${settings.companyName} — ` : ''}
            {settings.employeeName ? `${settings.employeeName} — ` : ''}
            از {formatJalali(from)} تا {formatJalali(to)}
          </p>
        </div>

        {list.length ? (
          <>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>شعبه</th>
                    <th>موضوع</th>
                    <th>شروع</th>
                    <th>پایان</th>
                    <th>روز</th>
                    {withCosts ? <th>ایاب و ذهاب</th> : null}
                    {withCosts ? <th>غذا</th> : null}
                    {withCosts ? <th>جمع</th> : null}
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m, i) => (
                    <tr key={m.id}>
                      <td className="num muted">{toFaDigits(i + 1)}</td>
                      <td className="nowrap">{m.branch}</td>
                      <td>{m.subject}</td>
                      <td className="num">{formatJalaliShort(m.startDate)}</td>
                      <td className="num">{formatJalaliShort(m.endDate)}</td>
                      <td className="num">{toFaDigits(daysBetween(m.startDate, m.endDate))}</td>
                      {withCosts ? <td className="num">{formatMoney(transportTotal(m))}</td> : null}
                      {withCosts ? <td className="num">{formatMoney(m.costFood)}</td> : null}
                      {withCosts ? <td className="num strong">{formatMoney(missionTotal(m))}</td> : null}
                      <td>
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5}>جمع ({toFaDigits(list.length)} ماموریت)</td>
                    <td className="num">{toFaDigits(daysSum)}</td>
                    {withCosts ? <td className="num">{formatMoney(totals.transport)}</td> : null}
                    {withCosts ? <td className="num">{formatMoney(totals.food)}</td> : null}
                    {withCosts ? <td className="num">{formatMoney(totals.all)}</td> : null}
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {withCosts ? (
              <div className="grid grid-4" style={{ marginTop: 16 }}>
                <div className="chip">
                  انجام شده: <b className="txt-done num">{formatMoney(totals.done)}</b>
                </div>
                <div className="chip">
                  بارگذاری شده: <b className="txt-uploaded num">{formatMoney(totals.uploaded)}</b>
                </div>
                <div className="chip">
                  پرداخت شده: <b className="txt-paid num">{formatMoney(totals.paid)}</b>
                </div>
                <div className="chip">
                  طلب از شرکت: <b className="num">{formatMoney(totals.receivable)}</b>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <Empty title="در این بازه ماموریتی ثبت نشده است" desc="بازه زمانی یا فیلترها را تغییر دهید." />
        )}
      </Card>
    </div>
  );
}
