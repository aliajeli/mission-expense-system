'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { getApi, isDesktop } from '@/lib/bridge';
import { uid } from '@/lib/format';
import {
  AppData,
  DEFAULT_SETTINGS,
  DocFile,
  DocKind,
  EMPTY_DATA,
  Mission,
  MissionStatus,
  Settings,
} from '@/lib/types';
import { toCompact } from '@/lib/jalali';

type Toast = { id: string; text: string; kind: 'ok' | 'err' | 'info' };

interface Ctx {
  ready: boolean;
  desktop: boolean;
  missions: Mission[];
  settings: Settings;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toast: (text: string, kind?: Toast['kind']) => void;
  toasts: Toast[];
  saveMission: (m: Mission) => Promise<void>;
  removeMission: (id: string) => Promise<void>;
  setStatus: (id: string, status: MissionStatus, patch?: Partial<Mission>) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  attachDocs: (id: string, kind: DocKind) => Promise<void>;
  detachDoc: (id: string, kind: DocKind, file: DocFile) => Promise<void>;
  openDoc: (file: DocFile) => Promise<void>;
  openFolder: (m: Mission, kind?: DocKind) => Promise<void>;
  exportText: (name: string, content: string, ext?: string) => Promise<void>;
  blankMission: () => Mission;
}

const AppCtx = createContext<Ctx | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('AppProvider missing');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const api = useRef(getApi());
  const desktop = useMemo(() => isDesktop(), [ready]);

  const toast = useCallback((text: string, kind: Toast['kind'] = 'info') => {
    const id = uid();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  useEffect(() => {
    api.current = getApi();
    api.current.load().then((d) => {
      setData({ missions: d.missions || [], settings: { ...DEFAULT_SETTINGS, ...d.settings } });
      setReady(true);
    });
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const persist = useCallback(
    async (next: AppData) => {
      setData(next);
      const res = await api.current.save(next);
      if (!res.ok) toast(res.error || 'خطا در ذخیره اطلاعات', 'err');
    },
    [toast],
  );

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  const blankMission = useCallback((): Mission => {
    const now = new Date().toISOString();
    return {
      id: uid(),
      branch: data.settings.branches[0] || '',
      subject: '',
      startDate: '',
      endDate: '',
      costGo: 0,
      costReturn: 0,
      costFood: 0,
      status: 'done',
      epmFoodCode: '',
      epmTransportCode: '',
      uploadedAt: null,
      paidAt: null,
      note: '',
      docs: { transport: [], food: [] },
      createdAt: now,
      updatedAt: now,
    };
  }, [data.settings.branches]);

  const saveMission = useCallback(
    async (m: Mission) => {
      const exists = data.missions.some((x) => x.id === m.id);
      const updated = { ...m, updatedAt: new Date().toISOString() };
      const missions = exists
        ? data.missions.map((x) => (x.id === m.id ? updated : x))
        : [updated, ...data.missions];
      await persist({ ...data, missions });
      toast(exists ? 'ماموریت به‌روزرسانی شد.' : 'ماموریت جدید ثبت شد.', 'ok');
    },
    [data, persist, toast],
  );

  const removeMission = useCallback(
    async (id: string) => {
      await persist({ ...data, missions: data.missions.filter((m) => m.id !== id) });
      toast('ماموریت حذف شد.', 'ok');
    },
    [data, persist, toast],
  );

  const setStatus = useCallback(
    async (id: string, status: MissionStatus, patch: Partial<Mission> = {}) => {
      const now = new Date().toISOString();
      const missions = data.missions.map((m) =>
        m.id === id
          ? {
              ...m,
              ...patch,
              status,
              uploadedAt: status === 'done' ? null : m.uploadedAt || now,
              paidAt: status === 'paid' ? m.paidAt || now : null,
              updatedAt: now,
            }
          : m,
      );
      await persist({ ...data, missions });
    },
    [data, persist],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      await persist({ ...data, settings: { ...data.settings, ...patch } });
    },
    [data, persist],
  );

  const attachDocs = useCallback(
    async (id: string, kind: DocKind) => {
      const mission = data.missions.find((m) => m.id === id);
      if (!mission) return;
      if (!data.settings.documentsRoot) {
        toast('ابتدا مسیر ذخیره اسناد را در تنظیمات مشخص کنید.', 'err');
        return;
      }
      const res = await api.current.pickDocs({
        root: data.settings.documentsRoot,
        dateCompact: toCompact(mission.startDate) || toCompact(mission.endDate),
        kind,
      });
      if (!res.ok) {
        toast(res.error || 'خطا در ذخیره اسناد', 'err');
        return;
      }
      if (!res.files || !res.files.length) return;
      const missions = data.missions.map((m) =>
        m.id === id ? { ...m, docs: { ...m.docs, [kind]: [...m.docs[kind], ...res.files!] } } : m,
      );
      await persist({ ...data, missions });
      toast(`${res.files.length} سند ذخیره شد.`, 'ok');
    },
    [data, persist, toast],
  );

  const detachDoc = useCallback(
    async (id: string, kind: DocKind, file: DocFile) => {
      await api.current.removeDoc(file.path);
      const missions = data.missions.map((m) =>
        m.id === id
          ? { ...m, docs: { ...m.docs, [kind]: m.docs[kind].filter((f) => f.path !== file.path) } }
          : m,
      );
      await persist({ ...data, missions });
      toast('سند حذف شد.', 'ok');
    },
    [data, persist, toast],
  );

  const openDoc = useCallback(
    async (file: DocFile) => {
      const res = await api.current.openPath(file.path);
      if (!res.ok) toast(res.error || 'امکان باز کردن فایل نیست.', 'err');
    },
    [toast],
  );

  const openFolder = useCallback(
    async (m: Mission, kind?: DocKind) => {
      const res = await api.current.revealFolder({
        root: data.settings.documentsRoot,
        dateCompact: toCompact(m.startDate) || toCompact(m.endDate),
        kind,
      });
      if (!res.ok) toast(res.error || 'امکان باز کردن پوشه نیست.', 'err');
    },
    [data.settings.documentsRoot, toast],
  );

  const exportText = useCallback(
    async (name: string, content: string, ext = 'csv') => {
      const res = await api.current.exportFile({
        defaultName: name,
        content,
        filters: [{ name: ext.toUpperCase(), extensions: [ext] }],
      });
      if (res.ok) toast('خروجی ذخیره شد.', 'ok');
    },
    [toast],
  );

  const value: Ctx = {
    ready,
    desktop,
    missions: data.missions,
    settings: data.settings,
    theme,
    toggleTheme,
    toast,
    toasts,
    saveMission,
    removeMission,
    setStatus,
    updateSettings,
    attachDocs,
    detachDoc,
    openDoc,
    openFolder,
    exportText,
    blankMission,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
