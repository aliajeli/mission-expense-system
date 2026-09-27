'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useApp } from '@/providers/AppProvider';
import { DOC_FOLDER, DOC_LABEL, DocKind, Mission } from '@/lib/types';
import { toCompact } from '@/lib/jalali';
import { formatBytes } from '@/lib/format';
import { IconEye, IconFolder, IconPaperclip, IconTrash } from '@/components/ui/Icons';
import Empty from '@/components/ui/Empty';

export default function DocsDialog({
  mission,
  onClose,
}: {
  mission: Mission | null;
  onClose: () => void;
}) {
  const { settings, attachDocs, detachDoc, openDoc, openFolder, missions } = useApp();
  const [kind, setKind] = useState<DocKind>('transport');
  const live = mission ? missions.find((m) => m.id === mission.id) || mission : null;

  if (!live) return null;

  const folder = toCompact(live.startDate) || toCompact(live.endDate);
  const files = live.docs[kind] || [];
  const path = settings.documentsRoot
    ? `${settings.documentsRoot}\\${folder}\\${DOC_FOLDER[kind]}`
    : 'مسیر ذخیره در تنظیمات مشخص نشده است';

  return (
    <Modal
      open={!!mission}
      title={`اسناد ماموریت — ${live.branch}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-primary" onClick={() => attachDocs(live.id, kind)}>
            <IconPaperclip size={15} /> افزودن سند {DOC_LABEL[kind]}
          </button>
          <button className="btn btn-ghost" onClick={() => openFolder(live, kind)}>
            <IconFolder size={15} /> باز کردن پوشه
          </button>
          <button className="btn btn-ghost" onClick={onClose} style={{ marginInlineStart: 'auto' }}>
            بستن
          </button>
        </>
      }
    >
      <div className="flex center gap-10" style={{ justifyContent: 'space-between' }}>
        <div className="tabs">
          {(['transport', 'food'] as DocKind[]).map((k) => (
            <button
              key={k}
              className={`tab ${kind === k ? 'active' : ''}`}
              onClick={() => setKind(k)}
            >
              {DOC_LABEL[k]} ({live.docs[k]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      <p className="muted" style={{ fontSize: 11.5, margin: '12px 0', direction: 'ltr', textAlign: 'left' }}>
        {path}
      </p>

      {files.length ? (
        <div className="docs-list">
          {files.map((f) => (
            <div className="doc-item" key={f.path}>
              <IconPaperclip size={15} />
              <span className="nm">{f.name}</span>
              <span className="muted nowrap">{formatBytes(f.size)}</span>
              <button className="btn btn-ghost btn-icon" title="نمایش" onClick={() => openDoc(f)}>
                <IconEye size={15} />
              </button>
              <button
                className="btn btn-ghost btn-icon"
                title="حذف"
                onClick={() => detachDoc(live.id, kind, f)}
              >
                <IconTrash size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title={`سندی برای ${DOC_LABEL[kind]} ثبت نشده است`}
          desc={`فایل‌ها در پوشه ${folder} / ${DOC_FOLDER[kind]} ذخیره می‌شوند.`}
        />
      )}
    </Modal>
  );
}
