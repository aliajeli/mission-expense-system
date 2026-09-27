'use client';

import { AppData, DEFAULT_SETTINGS, DocFile, DocKind, EMPTY_DATA } from './types';

export interface DesktopApi {
  load: () => Promise<AppData>;
  save: (data: AppData) => Promise<{ ok: boolean; error?: string }>;
  chooseFolder: () => Promise<string | null>;
  pickDocs: (p: {
    root: string;
    dateCompact: string;
    kind: DocKind;
  }) => Promise<{ ok: boolean; files?: DocFile[]; error?: string }>;
  removeDoc: (path: string) => Promise<{ ok: boolean; error?: string }>;
  openPath: (path: string) => Promise<{ ok: boolean; error?: string }>;
  revealFolder: (p: {
    root: string;
    dateCompact: string;
    kind?: DocKind;
  }) => Promise<{ ok: boolean; error?: string }>;
  exportFile: (p: {
    defaultName: string;
    content: string;
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<{ ok: boolean; path?: string; error?: string }>;
  info: () => Promise<{ version: string; platform: string; dataFile: string }>;
  print: () => Promise<{ ok: boolean }>;
}

const LS_KEY = 'mission-expenses-data';

/** نسخه مرورگر (حالت توسعه/پیش‌نمایش) - داده در localStorage نگهداری می‌شود */
const webApi: DesktopApi = {
  async load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return EMPTY_DATA;
      const parsed = JSON.parse(raw) as AppData;
      return {
        missions: parsed.missions || [],
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      };
    } catch {
      return EMPTY_DATA;
    }
  },
  async save(data) {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    return { ok: true };
  },
  async chooseFolder() {
    return null;
  },
  async pickDocs() {
    return { ok: false, error: 'انتخاب سند فقط در نسخه دسکتاپ فعال است.' };
  },
  async removeDoc() {
    return { ok: true };
  },
  async openPath() {
    return { ok: false, error: 'فقط در نسخه دسکتاپ' };
  },
  async revealFolder() {
    return { ok: false, error: 'فقط در نسخه دسکتاپ' };
  },
  async exportFile({ defaultName, content }) {
    const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultName;
    a.click();
    URL.revokeObjectURL(url);
    return { ok: true, path: defaultName };
  },
  async info() {
    return { version: 'web', platform: 'browser', dataFile: 'localStorage' };
  },
  async print() {
    window.print();
    return { ok: true };
  },
};

export function getApi(): DesktopApi {
  if (typeof window !== 'undefined' && (window as unknown as { desktop?: DesktopApi }).desktop) {
    return (window as unknown as { desktop: DesktopApi }).desktop;
  }
  return webApi;
}

export function isDesktop() {
  return typeof window !== 'undefined' && !!(window as unknown as { desktop?: unknown }).desktop;
}
