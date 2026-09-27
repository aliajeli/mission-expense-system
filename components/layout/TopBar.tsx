'use client';

import { ReactNode } from 'react';
import { useApp } from '@/providers/AppProvider';
import { IconMoon, IconSun } from '@/components/ui/Icons';
import { formatJalali, todayJalali, toKey } from '@/lib/jalali';

export default function TopBar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  const { theme, toggleTheme } = useApp();
  const t = todayJalali();

  return (
    <header className="topbar no-print">
      <div>
        <h1>{title}</h1>
        {subtitle ? <div className="sub">{subtitle}</div> : null}
      </div>
      <span style={{ flex: 1 }} />
      <span className="chip">{formatJalali(toKey(t.jy, t.jm, t.jd), true)}</span>
      {actions}
      <button
        className="btn btn-ghost btn-icon"
        onClick={toggleTheme}
        title={theme === 'light' ? 'حالت تیره' : 'حالت روشن'}
      >
        {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
      </button>
    </header>
  );
}
