import { Mission, MissionStatus, missionTotal, transportTotal } from './types';

export interface RangeFilter {
  q?: string;
  branch?: string;
  status?: MissionStatus | 'all';
  from?: string;
  to?: string;
}

/** فیلتر ماموریت‌ها بر اساس جستجو، شعبه، وضعیت و بازه تاریخ (تاریخ شروع ملاک است) */
export function filterMissions(missions: Mission[], f: RangeFilter) {
  const q = (f.q || '').trim().toLowerCase();
  return missions
    .filter((m) => {
      if (f.branch && f.branch !== 'all' && m.branch !== f.branch) return false;
      if (f.status && f.status !== 'all' && m.status !== f.status) return false;
      if (f.from && m.startDate < f.from) return false;
      if (f.to && m.startDate > f.to) return false;
      if (q) {
        const hay = `${m.branch} ${m.subject} ${m.note} ${m.epmFoodCode} ${m.epmTransportCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => (a.startDate < b.startDate ? 1 : a.startDate > b.startDate ? -1 : 0));
}

export interface Totals {
  done: number;
  uploaded: number;
  paid: number;
  all: number;
  receivable: number;
  transport: number;
  food: number;
  count: Record<MissionStatus, number>;
}

export function computeTotals(missions: Mission[]): Totals {
  const t: Totals = {
    done: 0,
    uploaded: 0,
    paid: 0,
    all: 0,
    receivable: 0,
    transport: 0,
    food: 0,
    count: { done: 0, uploaded: 0, paid: 0 },
  };
  for (const m of missions) {
    const total = missionTotal(m);
    t[m.status] += total;
    t.count[m.status] += 1;
    t.all += total;
    t.transport += transportTotal(m);
    t.food += m.costFood;
  }
  t.receivable = t.done + t.uploaded;
  return t;
}

export function groupByBranch(missions: Mission[]) {
  const map = new Map<string, { branch: string; total: number; count: number }>();
  for (const m of missions) {
    const cur = map.get(m.branch) || { branch: m.branch, total: 0, count: 0 };
    cur.total += missionTotal(m);
    cur.count += 1;
    map.set(m.branch, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function groupByMonth(missions: Mission[]) {
  const map = new Map<string, number>();
  for (const m of missions) {
    const key = m.startDate.slice(0, 7);
    map.set(key, (map.get(key) || 0) + missionTotal(m));
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).slice(-6);
}
