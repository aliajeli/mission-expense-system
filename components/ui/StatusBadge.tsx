import { MissionStatus, STATUS_LABEL } from '@/lib/types';

export default function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="dot" />
      {STATUS_LABEL[status]}
    </span>
  );
}
