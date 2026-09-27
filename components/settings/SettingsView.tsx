'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Field, Switch } from '@/components/ui/Field';
import BranchesEditor from './BranchesEditor';
import HolidaysEditor from './HolidaysEditor';
import { useApp } from '@/providers/AppProvider';
import { getApi } from '@/lib/bridge';
import { IconDownload, IconFolder } from '@/components/ui/Icons';
import { toFaDigits } from '@/lib/format';

export default function SettingsView() {
  const { settings, updateSettings, missions, desktop, toast, exportText } = useApp();
  const [info, setInfo] = useState({ version: '—', platform: '—', dataFile: '—' });

  useEffect(() => {
    getApi().info().then(setInfo);
  }, []);

  const chooseRoot = async () => {
    const path = await getApi().chooseFolder();
    if (path) {
      await updateSettings({ documentsRoot: path });
      toast('مسیر ذخیره اسناد به‌روزرسانی شد.', 'ok');
    }
  };

  const backup = () => {
    exportText(
      `backup-mission-expenses-${Date.now()}.json`,
      JSON.stringify({ missions, settings }, null, 2),
      'json',
    );
  };

  return (
    <div className="page-section">
      <div className="grid grid-2">
        <Card title="مسیر ذخیره اسناد" hint="محل نگهداری فایل‌های ایاب و ذهاب و غذا">
          <Field
            label="پوشه اصلی اسناد"
            hint="برای هر ماموریت پوشه‌ای با تاریخ شروع (مثال: ۱۴۰۵۰۷۰۵) و داخل آن پوشه‌های «ایاب و ذهاب» و «غذا» ساخته می‌شود."
          >
            <div className="path-box">
              <input
                className="input"
                value={settings.documentsRoot}
                placeholder={desktop ? 'انتخاب نشده' : 'فقط در نسخه دسکتاپ'}
                readOnly
              />
              <button className="btn btn-primary" onClick={chooseRoot} disabled={!desktop}>
                <IconFolder size={15} /> انتخاب…
              </button>
            </div>
          </Field>

          <div className="divider" style={{ margin: '14px 0' }} />

          <div className="grid grid-2">
            <Field label="نام کارمند">
              <input
                className="input"
                value={settings.employeeName}
                placeholder="برای درج در گزارش‌ها"
                onChange={(e) => updateSettings({ employeeName: e.target.value })}
              />
            </Field>
            <Field label="نام شرکت">
              <input
                className="input"
                value={settings.companyName}
                placeholder="برای درج در گزارش‌ها"
                onChange={(e) => updateSettings({ companyName: e.target.value })}
              />
            </Field>
            <Field label="واحد پول">
              <select
                className="select"
                value={settings.currency}
                onChange={(e) => updateSettings({ currency: e.target.value })}
              >
                <option value="تومان">تومان</option>
                <option value="ریال">ریال</option>
              </select>
            </Field>
            <Field label="تنظیم تقویم">
              <Switch
                checked={settings.thursdayOff}
                onChange={(v) => updateSettings({ thursdayOff: v })}
                label="پنج‌شنبه‌ها تعطیل محسوب شود"
              />
            </Field>
          </div>
        </Card>

        <Card title="شعب و محل‌های ماموریت">
          <BranchesEditor />
        </Card>
      </div>

      <Card title="تعطیلات اختصاصی تقویم">
        <HolidaysEditor />
      </Card>

      <Card title="پشتیبان‌گیری و اطلاعات برنامه">
        <div className="grid grid-2">
          <div>
            <div className="kv">
              <span className="k">تعداد ماموریت‌های ثبت‌شده</span>
              <span className="v num">{toFaDigits(missions.length)}</span>
            </div>
            <div className="kv">
              <span className="k">نسخه برنامه</span>
              <span className="v num">{info.version}</span>
            </div>
            <div className="kv">
              <span className="k">محل ذخیره پایگاه داده</span>
              <span className="v" style={{ direction: 'ltr', fontSize: 11 }}>
                {info.dataFile}
              </span>
            </div>
          </div>
          <div className="flex center gap-10" style={{ alignItems: 'flex-start' }}>
            <button className="btn btn-ghost" onClick={backup}>
              <IconDownload size={15} /> تهیه نسخه پشتیبان (JSON)
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
