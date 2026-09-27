'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { useApp } from '@/providers/AppProvider';
import { Mission, missionTotal } from '@/lib/types';
import { formatJalaliShort } from '@/lib/jalali';
import { formatMoney } from '@/lib/format';

export default function EpmDialog({
  mission,
  onClose,
}: {
  mission: Mission | null;
  onClose: () => void;
}) {
  const { setStatus, settings, toast } = useApp();
  const [food, setFood] = useState(mission?.epmFoodCode || '');
  const [transport, setTransport] = useState(mission?.epmTransportCode || '');
  const [err, setErr] = useState<Record<string, string>>({});

  if (!mission) return null;

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!food.trim()) e.food = 'کد ثبت غذا الزامی است.';
    if (!transport.trim()) e.transport = 'کد ثبت ایاب و ذهاب الزامی است.';
    setErr(e);
    if (Object.keys(e).length) return;
    await setStatus(mission.id, 'uploaded', {
      epmFoodCode: food.trim(),
      epmTransportCode: transport.trim(),
    });
    toast('ماموریت در EPM ثبت و وضعیت به «بارگذاری شده» تغییر کرد.', 'ok');
    onClose();
  };

  return (
    <Modal
      open={!!mission}
      title="ثبت در EPM"
      size="sm"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-primary" onClick={submit}>
            ثبت و تغییر وضعیت
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            انصراف
          </button>
        </>
      }
    >
      <div className="kv">
        <span className="k">ماموریت</span>
        <span className="v">
          {mission.branch} — {mission.subject}
        </span>
      </div>
      <div className="kv">
        <span className="k">بازه</span>
        <span className="v num">
          {formatJalaliShort(mission.startDate)} تا {formatJalaliShort(mission.endDate)}
        </span>
      </div>
      <div className="kv">
        <span className="k">مبلغ کل</span>
        <span className="v num">
          {formatMoney(missionTotal(mission))} {settings.currency}
        </span>
      </div>

      <div className="divider" style={{ margin: '14px 0' }} />

      <div className="grid" style={{ gap: 14 }}>
        <Field label="کد ثبت غذا در EPM" required error={err.food}>
          <input
            className="input"
            value={food}
            placeholder="مثال: EPM-F-10234"
            onChange={(e) => setFood(e.target.value)}
          />
        </Field>
        <Field label="کد ثبت ایاب و ذهاب در EPM" required error={err.transport}>
          <input
            className="input"
            value={transport}
            placeholder="مثال: EPM-T-10235"
            onChange={(e) => setTransport(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
