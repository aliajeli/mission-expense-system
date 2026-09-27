'use client';

import { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import MoneyInput from '@/components/ui/MoneyInput';
import JalaliDatePicker from '@/components/date/JalaliDatePicker';
import { useApp } from '@/providers/AppProvider';
import { Mission, missionTotal } from '@/lib/types';
import { daysBetween } from '@/lib/jalali';
import { countHolidays } from '@/lib/holidays';
import { formatMoney, toFaDigits } from '@/lib/format';

const OTHER = '__other__';

export default function MissionForm({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial: Mission | null;
  onClose: () => void;
}) {
  const { settings, saveMission, blankMission, updateSettings } = useApp();
  const base = initial || blankMission();
  const known = settings.branches.includes(base.branch) || !base.branch;

  const [form, setForm] = useState<Mission>(base);
  const [branchMode, setBranchMode] = useState<string>(known ? base.branch : OTHER);
  const [customBranch, setCustomBranch] = useState(known ? '' : base.branch);
  const [rememberBranch, setRememberBranch] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Mission>(k: K, v: Mission[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const days = useMemo(
    () => (form.startDate && form.endDate ? daysBetween(form.startDate, form.endDate) : 0),
    [form.startDate, form.endDate],
  );
  const holidays = useMemo(
    () =>
      form.startDate && form.endDate
        ? countHolidays(form.startDate, form.endDate, settings.customHolidays, settings.thursdayOff)
        : 0,
    [form.startDate, form.endDate, settings.customHolidays, settings.thursdayOff],
  );

  const branch = branchMode === OTHER ? customBranch.trim() : branchMode;
  const total = missionTotal(form);

  const submit = async () => {
    const err: Record<string, string> = {};
    if (!branch) err.branch = 'انتخاب یا ورود نام شعبه الزامی است.';
    if (!form.subject.trim()) err.subject = 'موضوع ماموریت را وارد کنید.';
    if (!form.startDate) err.startDate = 'تاریخ شروع را انتخاب کنید.';
    if (!form.endDate) err.endDate = 'تاریخ پایان را انتخاب کنید.';
    if (form.startDate && form.endDate && days <= 0)
      err.endDate = 'تاریخ پایان نباید قبل از تاریخ شروع باشد.';
    setErrors(err);
    if (Object.keys(err).length) return;

    if (branchMode === OTHER && rememberBranch && !settings.branches.includes(branch)) {
      await updateSettings({ branches: [...settings.branches, branch] });
    }
    await saveMission({ ...form, branch, subject: form.subject.trim() });
    onClose();
  };

  return (
    <Modal
      open={open}
      title={initial ? 'ویرایش ماموریت' : 'ثبت ماموریت جدید'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn btn-primary" onClick={submit}>
            {initial ? 'ذخیره تغییرات' : 'ثبت ماموریت'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            انصراف
          </button>
          <span className="spacer" style={{ flex: 1 }} />
          <span className="muted" style={{ alignSelf: 'center', fontSize: 12.5 }}>
            جمع هزینه: <b className="strong">{formatMoney(total)}</b> {settings.currency}
          </span>
        </>
      }
    >
      <div className="grid grid-2">
        <Field label="شعبه / محل ماموریت" required error={errors.branch}>
          <select
            className="select"
            value={branchMode}
            onChange={(e) => setBranchMode(e.target.value)}
          >
            {settings.branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
            <option value={OTHER}>سایر (ورود دستی)…</option>
          </select>
        </Field>

        {branchMode === OTHER ? (
          <Field label="نام محل ماموریت" required error={errors.branch}>
            <input
              className="input"
              value={customBranch}
              placeholder="مثال: چالوس"
              onChange={(e) => setCustomBranch(e.target.value)}
            />
            <label className="switch" style={{ marginTop: 6 }}>
              <input
                type="checkbox"
                checked={rememberBranch}
                onChange={(e) => setRememberBranch(e.target.checked)}
              />
              <span className="track" />
              <span style={{ fontSize: 12 }}>به فهرست شعب اضافه شود</span>
            </label>
          </Field>
        ) : (
          <Field label="موضوع ماموریت" required error={errors.subject}>
            <input
              className="input"
              value={form.subject}
              placeholder="مثال: پشتیبانی شبکه شعبه"
              onChange={(e) => set('subject', e.target.value)}
            />
          </Field>
        )}

        {branchMode === OTHER ? (
          <Field label="موضوع ماموریت" required error={errors.subject}>
            <input
              className="input"
              value={form.subject}
              placeholder="مثال: پشتیبانی شبکه شعبه"
              onChange={(e) => set('subject', e.target.value)}
            />
          </Field>
        ) : null}

        <Field label="تاریخ شروع ماموریت" required error={errors.startDate}>
          <JalaliDatePicker
            value={form.startDate}
            onChange={(v) => {
              set('startDate', v);
              if (form.endDate && v && form.endDate < v) set('endDate', v);
            }}
            customHolidays={settings.customHolidays}
            thursdayOff={settings.thursdayOff}
          />
        </Field>

        <Field label="تاریخ پایان ماموریت" required error={errors.endDate}>
          <JalaliDatePicker
            value={form.endDate}
            onChange={(v) => set('endDate', v)}
            customHolidays={settings.customHolidays}
            thursdayOff={settings.thursdayOff}
            minKey={form.startDate || undefined}
          />
        </Field>
      </div>

      <div className="card" style={{ marginTop: 16, background: 'var(--surface-2)' }}>
        <div className="card-body flex center gap-10" style={{ flexWrap: 'wrap' }}>
          <span className="chip">
            مدت ماموریت:&nbsp;<b>{days ? toFaDigits(days) : '—'}</b>&nbsp;روز
          </span>
          <span className="chip">
            روزهای تعطیل در بازه:&nbsp;<b>{toFaDigits(holidays)}</b>
          </span>
          <span className="chip">
            روزهای کاری:&nbsp;<b>{toFaDigits(Math.max(days - holidays, 0))}</b>
          </span>
          <span className="muted" style={{ fontSize: 11.5 }}>
            مدت ماموریت به‌صورت خودکار از تاریخ شروع و پایان محاسبه می‌شود.
          </span>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginTop: 16 }}>
        <Field label="هزینه رفت">
          <MoneyInput
            value={form.costGo}
            currency={settings.currency}
            onChange={(v) => set('costGo', v)}
          />
        </Field>
        <Field label="هزینه برگشت">
          <MoneyInput
            value={form.costReturn}
            currency={settings.currency}
            onChange={(v) => set('costReturn', v)}
          />
        </Field>
        <Field label="هزینه غذا">
          <MoneyInput
            value={form.costFood}
            currency={settings.currency}
            onChange={(v) => set('costFood', v)}
          />
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <Field label="توضیحات (اختیاری)">
          <textarea
            className="input"
            rows={2}
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="یادداشت داخلی…"
          />
        </Field>
      </div>
    </Modal>
  );
}
