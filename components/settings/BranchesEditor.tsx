'use client';

import { useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { IconPlus, IconTrash } from '@/components/ui/Icons';

export default function BranchesEditor() {
  const { settings, updateSettings, missions, toast } = useApp();
  const [name, setName] = useState('');

  const add = async () => {
    const v = name.trim();
    if (!v) return;
    if (settings.branches.includes(v)) {
      toast('این شعبه قبلاً ثبت شده است.', 'err');
      return;
    }
    await updateSettings({ branches: [...settings.branches, v] });
    setName('');
  };

  const remove = async (b: string) => {
    if (missions.some((m) => m.branch === b)) {
      toast('برای این شعبه ماموریت ثبت شده و قابل حذف نیست.', 'err');
      return;
    }
    await updateSettings({ branches: settings.branches.filter((x) => x !== b) });
  };

  return (
    <div>
      <div className="flex gap-10">
        <input
          className="input"
          placeholder="نام شعبه جدید…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn btn-primary" onClick={add}>
          <IconPlus size={15} /> افزودن
        </button>
      </div>

      <div className="docs-list" style={{ marginTop: 12 }}>
        {settings.branches.map((b) => (
          <div className="doc-item" key={b}>
            <span className="nm">{b}</span>
            <span className="muted">
              {missions.filter((m) => m.branch === b).length ? 'دارای ماموریت' : ''}
            </span>
            <button className="btn btn-ghost btn-icon" title="حذف" onClick={() => remove(b)}>
              <IconTrash size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
