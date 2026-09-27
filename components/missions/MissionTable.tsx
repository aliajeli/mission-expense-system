'use client';

import StatusBadge from '@/components/ui/StatusBadge';
import Empty from '@/components/ui/Empty';
import { Mission, missionTotal, transportTotal } from '@/lib/types';
import { daysBetween, formatJalaliShort } from '@/lib/jalali';
import { formatMoney, toFaDigits } from '@/lib/format';
import {
  IconCheck,
  IconEdit,
  IconEpm,
  IconPaperclip,
  IconTrash,
} from '@/components/ui/Icons';

interface Props {
  missions: Mission[];
  currency: string;
  onEdit: (m: Mission) => void;
  onDelete: (m: Mission) => void;
  onEpm: (m: Mission) => void;
  onPaid: (m: Mission) => void;
  onDocs: (m: Mission) => void;
}

export default function MissionTable({
  missions,
  currency,
  onEdit,
  onDelete,
  onEpm,
  onPaid,
  onDocs,
}: Props) {
  if (!missions.length) {
    return <Empty title="ماموریتی یافت نشد" desc="با دکمه «ثبت ماموریت جدید» اولین رکورد را اضافه کنید." />;
  }

  const sum = missions.reduce(
    (a, m) => ({
      transport: a.transport + transportTotal(m),
      food: a.food + m.costFood,
      total: a.total + missionTotal(m),
      days: a.days + daysBetween(m.startDate, m.endDate),
    }),
    { transport: 0, food: 0, total: 0, days: 0 },
  );

  return (
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
            <th>ایاب و ذهاب</th>
            <th>غذا</th>
            <th>جمع</th>
            <th>وضعیت</th>
            <th>اسناد</th>
            <th className="no-print">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {missions.map((m, i) => {
            const docs = (m.docs?.transport?.length || 0) + (m.docs?.food?.length || 0);
            return (
              <tr key={m.id}>
                <td className="num muted">{toFaDigits(i + 1)}</td>
                <td className="nowrap">{m.branch}</td>
                <td>
                  {m.subject}
                  {m.epmFoodCode || m.epmTransportCode ? (
                    <div className="muted" style={{ fontSize: 11 }}>
                      EPM: {m.epmTransportCode || '—'} / {m.epmFoodCode || '—'}
                    </div>
                  ) : null}
                </td>
                <td className="num">{formatJalaliShort(m.startDate)}</td>
                <td className="num">{formatJalaliShort(m.endDate)}</td>
                <td className="num">{toFaDigits(daysBetween(m.startDate, m.endDate))}</td>
                <td className="num">{formatMoney(transportTotal(m))}</td>
                <td className="num">{formatMoney(m.costFood)}</td>
                <td className="num strong">{formatMoney(missionTotal(m))}</td>
                <td>
                  <StatusBadge status={m.status} />
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => onDocs(m)}>
                    <IconPaperclip size={14} /> {toFaDigits(docs)}
                  </button>
                </td>
                <td className="no-print">
                  <div className="row-actions">
                    {m.status === 'done' ? (
                      <button
                        className="btn btn-sm"
                        title="ثبت در EPM"
                        onClick={() => onEpm(m)}
                      >
                        <IconEpm size={14} /> ثبت در EPM
                      </button>
                    ) : null}
                    {m.status === 'uploaded' ? (
                      <button
                        className="btn btn-sm btn-success"
                        title="ثبت پرداخت"
                        onClick={() => onPaid(m)}
                      >
                        <IconCheck size={14} /> پرداخت شد
                      </button>
                    ) : null}
                    <button className="btn btn-ghost btn-icon" title="ویرایش" onClick={() => onEdit(m)}>
                      <IconEdit size={15} />
                    </button>
                    <button className="btn btn-ghost btn-icon" title="حذف" onClick={() => onDelete(m)}>
                      <IconTrash size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5}>جمع کل ({toFaDigits(missions.length)} ماموریت)</td>
            <td className="num">{toFaDigits(sum.days)}</td>
            <td className="num">{formatMoney(sum.transport)}</td>
            <td className="num">{formatMoney(sum.food)}</td>
            <td className="num">
              {formatMoney(sum.total)} <span className="muted">{currency}</span>
            </td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
