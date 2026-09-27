'use client';

import { useEffect, useState } from 'react';
import Sidebar, { ViewKey } from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Toasts from '@/components/layout/Toasts';
import DashboardView from '@/components/dashboard/DashboardView';
import MissionsView from '@/components/missions/MissionsView';
import ReportView from '@/components/reports/ReportView';
import SettingsView from '@/components/settings/SettingsView';
import { useApp } from '@/providers/AppProvider';
import { getApi } from '@/lib/bridge';
import { IconPlus } from '@/components/ui/Icons';

const TITLES: Record<ViewKey, { title: string; sub: string }> = {
  dashboard: { title: 'داشبورد', sub: 'نمای کلی هزینه‌ها و وضعیت پرداخت‌ها' },
  missions: { title: 'ماموریت‌ها', sub: 'ثبت، ویرایش و پیگیری وضعیت ماموریت‌ها' },
  reports: { title: 'گزارش‌ها', sub: 'گزارش ماموریت‌ها در بازه زمانی دلخواه' },
  settings: { title: 'تنظیمات', sub: 'مسیر اسناد، شعب، تقویم و پشتیبان‌گیری' },
};

export default function Page() {
  const { ready } = useApp();
  const [view, setView] = useState<ViewKey>('dashboard');
  const [formOpen, setFormOpen] = useState(false);
  const [version, setVersion] = useState('1.0.0');

  useEffect(() => {
    getApi()
      .info()
      .then((i) => setVersion(i.version));
  }, []);

  const newMission = () => {
    setView('missions');
    setFormOpen(true);
  };

  return (
    <div className="app-shell">
      <Sidebar view={view} onChange={setView} version={version} />
      <main className="main">
        <TopBar
          title={TITLES[view].title}
          subtitle={TITLES[view].sub}
          actions={
            view !== 'settings' ? (
              <button className="btn btn-primary btn-sm" onClick={newMission}>
                <IconPlus size={15} /> ماموریت جدید
              </button>
            ) : null
          }
        />
        <div className="content">
          {!ready ? (
            <p className="muted">در حال بارگذاری…</p>
          ) : view === 'dashboard' ? (
            <DashboardView onNew={newMission} />
          ) : view === 'missions' ? (
            <MissionsView formOpen={formOpen} onFormOpenChange={setFormOpen} />
          ) : view === 'reports' ? (
            <ReportView />
          ) : (
            <SettingsView />
          )}
        </div>
      </main>
      <Toasts />
    </div>
  );
}
