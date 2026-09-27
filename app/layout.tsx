import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/providers/AppProvider';

export const metadata: Metadata = {
  title: 'سامانه هزینه ماموریت',
  description: 'مدیریت، پیگیری و گزارش‌گیری هزینه‌های ماموریت اداری',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="light">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
