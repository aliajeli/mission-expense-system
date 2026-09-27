import { ReactNode } from 'react';

export default function Empty({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        <path d="M9 13h6" />
      </svg>
      <span className="ttl">{title}</span>
      {desc ? <span>{desc}</span> : null}
      {action}
    </div>
  );
}
