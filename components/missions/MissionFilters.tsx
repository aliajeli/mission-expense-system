'use client';

import JalaliDatePicker from '@/components/date/JalaliDatePicker';
import { IconSearch } from '@/components/ui/Icons';
import { MissionStatus, STATUS_LABEL, STATUS_ORDER } from '@/lib/types';

export interface Filters {
  q: string;
  branch: string;
  status: MissionStatus | 'all';
  from: string;
  to: string;
}

export const EMPTY_FILTERS: Filters = { q: '', branch: 'all', status: 'all', from: '', to: '' };

export default function MissionFilters({
  filters,
  branches,
  onChange,
}: {
  filters: Filters;
  branches: string[];
  onChange: (f: Filters) => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const dirty = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <div className="toolbar">
      <div className="search">
        <IconSearch />
        <input
          className="input"
          placeholder="جستجو در موضوع، شعبه یا کد EPM…"
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
        />
      </div>

      <select
        className="select"
        style={{ width: 150 }}
        value={filters.branch}
        onChange={(e) => set({ branch: e.target.value })}
      >
        <option value="all">همه شعب</option>
        {branches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <select
        className="select"
        style={{ width: 150 }}
        value={filters.status}
        onChange={(e) => set({ status: e.target.value as Filters['status'] })}
      >
        <option value="all">همه وضعیت‌ها</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>

      <div style={{ width: 190 }}>
        <JalaliDatePicker value={filters.from} onChange={(v) => set({ from: v })} placeholder="از تاریخ" />
      </div>
      <div style={{ width: 190 }}>
        <JalaliDatePicker value={filters.to} onChange={(v) => set({ to: v })} placeholder="تا تاریخ" />
      </div>

      {dirty ? (
        <button className="btn btn-ghost btn-sm" onClick={() => onChange(EMPTY_FILTERS)}>
          حذف فیلترها
        </button>
      ) : null}
    </div>
  );
}
