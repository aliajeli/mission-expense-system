'use client';

import Modal from './Modal';

export default function Confirm({
  open,
  title,
  message,
  confirmLabel = 'تایید',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>
            انصراف
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-soft)' }}>{message}</p>
    </Modal>
  );
}
