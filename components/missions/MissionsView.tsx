'use client';

import { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Confirm from '@/components/ui/Confirm';
import MissionFilters, { EMPTY_FILTERS, Filters } from './MissionFilters';
import MissionTable from './MissionTable';
import MissionForm from './MissionForm';
import EpmDialog from './EpmDialog';
import DocsDialog from './DocsDialog';
import { useApp } from '@/providers/AppProvider';
import { computeTotals, filterMissions } from '@/lib/filters';
import { Mission } from '@/lib/types';
import { formatMoney } from '@/lib/format';
import { IconPlus } from '@/components/ui/Icons';

export default function MissionsView({
  formOpen,
  onFormOpenChange,
}: {
  formOpen: boolean;
  onFormOpenChange: (v: boolean) => void;
}) {
  const { missions, settings, removeMission, setStatus, toast } = useApp();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [editing, setEditing] = useState<Mission | null>(null);
  const [epmFor, setEpmFor] = useState<Mission | null>(null);
  const [docsFor, setDocsFor] = useState<Mission | null>(null);
  const [toDelete, setToDelete] = useState<Mission | null>(null);
  const [toPay, setToPay] = useState<Mission | null>(null);

  const list = useMemo(() => filterMissions(missions, filters), [missions, filters]);
  const totals = useMemo(() => computeTotals(list), [list]);

  const openNew = () => {
    setEditing(null);
    onFormOpenChange(true);
  };

  return (
    <div className="page-section">
      <Card>
        <MissionFilters filters={filters} branches={settings.branches} onChange={setFilters} />
        <div className="divider" style={{ margin: '14px 0' }} />
        <div className="toolbar">
          <span className="chip">
            انجام شده:&nbsp;<b className="txt-done num">{formatMoney(totals.done)}</b>
          </span>
          <span className="chip">
            بارگذاری شده:&nbsp;<b className="txt-uploaded num">{formatMoney(totals.uploaded)}</b>
          </span>
          <span className="chip">
            پرداخت شده:&nbsp;<b className="txt-paid num">{formatMoney(totals.paid)}</b>
          </span>
          <span className="chip">
            طلب از شرکت:&nbsp;<b className="num">{formatMoney(totals.receivable)}</b>
          </span>
          <span style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={openNew}>
            <IconPlus size={16} /> ثبت ماموریت جدید
          </button>
        </div>
      </Card>

      <Card bodyClass="">
        <MissionTable
          missions={list}
          currency={settings.currency}
          onEdit={(m) => {
            setEditing(m);
            onFormOpenChange(true);
          }}
          onDelete={setToDelete}
          onEpm={setEpmFor}
          onPaid={setToPay}
          onDocs={setDocsFor}
        />
      </Card>

      {formOpen ? (
        <MissionForm
          open={formOpen}
          initial={editing}
          onClose={() => {
            onFormOpenChange(false);
            setEditing(null);
          }}
        />
      ) : null}

      <EpmDialog mission={epmFor} onClose={() => setEpmFor(null)} />
      <DocsDialog mission={docsFor} onClose={() => setDocsFor(null)} />

      <Confirm
        open={!!toDelete}
        danger
        title="حذف ماموریت"
        message={`آیا از حذف ماموریت «${toDelete?.subject}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
        confirmLabel="حذف"
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await removeMission(toDelete.id);
          setToDelete(null);
        }}
      />

      <Confirm
        open={!!toPay}
        title="ثبت پرداخت"
        message="آیا مبلغ این ماموریت توسط شرکت پرداخت شده است؟ وضعیت به «پرداخت شده» تغییر می‌کند."
        confirmLabel="بله، پرداخت شد"
        onCancel={() => setToPay(null)}
        onConfirm={async () => {
          if (toPay) {
            await setStatus(toPay.id, 'paid');
            toast('وضعیت به «پرداخت شده» تغییر کرد.', 'ok');
          }
          setToPay(null);
        }}
      />
    </div>
  );
}
