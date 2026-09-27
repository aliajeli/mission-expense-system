'use client';

import { useState } from 'react';
import JalaliDatePicker from '@/components/date/JalaliDatePicker';
import { useApp } from '@/providers/AppProvider';
import { formatJalali } from '@/lib/jalali';
import { IconPlus, IconTrash } from '@/components/ui/Icons';

export default function HolidaysEditor() {
  const { settings, updateSettings, toast } = useApp();
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');

  const entries = Object.entries(settings.customHolidays).sort((a, b) => (a[0] < b[0] ? -1 : 1));

  const add = async () => {
    if (!date) {
      toast('تاریخ تعطیلی را انتخاب کنید.', 'err');
      return;
    }
    await updateSettings({
      customHolidays: { ...settings.customHolidays, [date]: title.trim() || 'تعطیل' },
    });
    setDate('');
    setTitle('');
  };

  const remove = async (key: string) => {
    const next = { ...settings.customHolidays };
    delete next[key];
    await updateSettings({ customHolidays: next });
  };

  return (
    <div>
      <p className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
        تعطیلات رسمی سال‌های ۱۴۰۴ تا ۱۴۰۶ به‌همراه جمعه‌ها به‌صورت پیش‌فرض در تقویم مشخص شده‌اند. در
        صورت نیاز می‌توانید تعطیلی اختصاصی (مثلاً تعطیلی استانی) اضافه کنید.
      </p>

      <div className="grid grid-3" style={{ alignItems: 'end' }}>
        <JalaliDatePicker
          value={date}
          onChange={setDate}
          customHolidays={settings.customHolidays}
          thursdayOff={settings.thursdayOff}
          placeholder="تاریخ تعطیلی"
        />
        <input
          className="input"
          placeholder="عنوان (اختیاری)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn btn-primary" onClick={add} style={{ width: 'fit-content' }}>
          <IconPlus size={15} /> افزودن تعطیلی
        </button>
      </div>

      {entries.length ? (
        <div className="docs-list" style={{ marginTop: 14 }}>
          {entries.map(([key, val]) => (
            <div className="doc-item" key={key}>
              <span className="nm">
                {formatJalali(key, true)} — {val}
              </span>
              <button className="btn btn-ghost btn-icon" onClick={() => remove(key)} title="حذف">
                <IconTrash size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
