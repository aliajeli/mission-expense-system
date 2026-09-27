'use client';

import { IconDashboard, IconList, IconReport, IconSettings } from '@/components/ui/Icons';
import { toFaDigits } from '@/lib/format';

export type ViewKey = 'dashboard' | 'missions' | 'reports' | 'settings';

const NAV: { key: ViewKey; label: string; Icon: typeof IconDashboard }[] = [
  { key: 'dashboard', label: 'داشبورد', Icon: IconDashboard },
  { key: 'missions', label: 'ماموریت‌ها', Icon: IconList },
  { key: 'reports', label: 'گزارش‌ها', Icon: IconReport },
  { key: 'settings', label: 'تنظیمات', Icon: IconSettings },
];

export default function Sidebar({
  view,
  onChange,
  version,
}: {
  view: ViewKey;
  onChange: (v: ViewKey) => void;
  version: string;
}) {
  return (
    <aside className="sidebar no-print">
      <div className="brand">
        <div className="brand-mark">هـ</div>
        <div>
          <div className="brand-title">سامانه هزینه ماموریت</div>
          <div className="brand-sub">مدیریت هزینه‌های اداری</div>
        </div>
      </div>

      {NAV.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`nav-item ${view === key ? 'active' : ''}`}
          onClick={() => onChange(key)}
        >
          <Icon size={17} className="icon" />
          {label}
        </button>
      ))}

      <div className="sidebar-footer">
        <span>نسخه {toFaDigits(version)}</span>
      </div>
    </aside>
  );
}
