export type MissionStatus = 'done' | 'uploaded' | 'paid';

export const STATUS_LABEL: Record<MissionStatus, string> = {
  done: 'انجام شده',
  uploaded: 'بارگذاری شده',
  paid: 'پرداخت شده',
};

export const STATUS_ORDER: MissionStatus[] = ['done', 'uploaded', 'paid'];

export type DocKind = 'transport' | 'food';

export const DOC_LABEL: Record<DocKind, string> = {
  transport: 'ایاب و ذهاب',
  food: 'غذا',
};

/** نام پوشه‌ای که اسناد هر نوع هزینه داخل آن ذخیره می‌شود */
export const DOC_FOLDER: Record<DocKind, string> = {
  transport: 'ایاب و ذهاب',
  food: 'غذا',
};

export interface DocFile {
  name: string;
  path: string;
  size: number;
  addedAt: string;
}

export interface Mission {
  id: string;
  branch: string;
  subject: string;
  startDate: string; // 1405-07-05
  endDate: string;
  costGo: number;
  costReturn: number;
  costFood: number;
  status: MissionStatus;
  epmFoodCode: string;
  epmTransportCode: string;
  uploadedAt: string | null;
  paidAt: string | null;
  note: string;
  docs: { transport: DocFile[]; food: DocFile[] };
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  documentsRoot: string;
  branches: string[];
  customHolidays: Record<string, string>;
  thursdayOff: boolean;
  currency: string;
  employeeName: string;
  companyName: string;
}

export interface AppData {
  missions: Mission[];
  settings: Settings;
}

export const DEFAULT_BRANCHES = ['رامسر', 'نوشهر', 'رویان'];

export const DEFAULT_SETTINGS: Settings = {
  documentsRoot: '',
  branches: [...DEFAULT_BRANCHES],
  customHolidays: {},
  thursdayOff: false,
  currency: 'تومان',
  employeeName: '',
  companyName: '',
};

export const EMPTY_DATA: AppData = { missions: [], settings: DEFAULT_SETTINGS };

export function missionTotal(m: Mission) {
  return (m.costGo || 0) + (m.costReturn || 0) + (m.costFood || 0);
}

export function transportTotal(m: Mission) {
  return (m.costGo || 0) + (m.costReturn || 0);
}
