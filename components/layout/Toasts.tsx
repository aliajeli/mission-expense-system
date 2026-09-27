'use client';

import { useApp } from '@/providers/AppProvider';

export default function Toasts() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap no-print">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind === 'info' ? '' : t.kind}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
