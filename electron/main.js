'use strict';

const { app, BrowserWindow, ipcMain, dialog, shell, protocol, net, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const { pathToFileURL } = require('node:url');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

app.setName('Mission Expenses');
const OUT_DIR = path.join(__dirname, '..', 'out');
const DATA_FILE = () => path.join(app.getPath('userData'), 'data.json');

const DEFAULT_DATA = {
  missions: [],
  settings: {
    documentsRoot: '',
    branches: ['رامسر', 'نوشهر', 'رویان'],
    customHolidays: {},
    thursdayOff: false,
    currency: 'تومان',
    employeeName: '',
    companyName: '',
  },
};

const DOC_FOLDER = { transport: 'ایاب و ذهاب', food: 'غذا' };

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

/* ---------------------------------- داده ---------------------------------- */

async function readData() {
  try {
    const raw = await fsp.readFile(DATA_FILE(), 'utf8');
    const parsed = JSON.parse(raw);
    return {
      missions: Array.isArray(parsed.missions) ? parsed.missions : [],
      settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return DEFAULT_DATA;
  }
}

async function writeData(data) {
  const file = DATA_FILE();
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fsp.rename(tmp, file);
  return { ok: true };
}

/* --------------------------------- اسناد ---------------------------------- */

function sanitize(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
}

async function uniqueTarget(dir, fileName) {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  let candidate = path.join(dir, fileName);
  let i = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${base}-${i}${ext}`);
    i += 1;
  }
  return candidate;
}

async function targetDir(root, dateCompact, kind) {
  const dir = path.join(root, sanitize(dateCompact), DOC_FOLDER[kind] || String(kind));
  await fsp.mkdir(dir, { recursive: true });
  return dir;
}

/* -------------------------------- پنجره ----------------------------------- */

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1340,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    backgroundColor: '#0f1420',
    autoHideMenuBar: true,
    title: 'سامانه هزینه ماموریت',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('[load-failed]', code, desc, url);
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL(process.env.DEV_URL || 'http://localhost:3000');
  } else {
    mainWindow.loadURL('app://local/index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerAppProtocol() {
  protocol.handle('app', async (request) => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    if (!pathname || pathname === '/') pathname = '/index.html';
    let filePath = path.join(OUT_DIR, pathname);
    if (!filePath.startsWith(OUT_DIR)) return new Response('Forbidden', { status: 403 });
    if (!fs.existsSync(filePath)) {
      const asHtml = `${filePath}.html`;
      filePath = fs.existsSync(asHtml) ? asHtml : path.join(OUT_DIR, 'index.html');
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

/* ---------------------------------- IPC ----------------------------------- */

function registerIpc() {
  ipcMain.handle('data:load', () => readData());
  ipcMain.handle('data:save', (_e, data) => writeData(data));

  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    platform: process.platform,
    dataFile: DATA_FILE(),
  }));

  ipcMain.handle('dialog:folder', async () => {
    const res = await dialog.showOpenDialog(mainWindow, {
      title: 'انتخاب مسیر ذخیره اسناد',
      properties: ['openDirectory', 'createDirectory'],
    });
    return res.canceled ? null : res.filePaths[0];
  });

  ipcMain.handle('docs:pick', async (_e, { root, dateCompact, kind }) => {
    if (!root) return { ok: false, error: 'ابتدا مسیر ذخیره اسناد را در تنظیمات مشخص کنید.' };
    const res = await dialog.showOpenDialog(mainWindow, {
      title: `انتخاب اسناد ${DOC_FOLDER[kind] || ''}`,
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'اسناد و تصاویر', extensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'doc', 'docx', 'xls', 'xlsx'] },
        { name: 'همه فایل‌ها', extensions: ['*'] },
      ],
    });
    if (res.canceled) return { ok: true, files: [] };
    try {
      const dir = await targetDir(root, dateCompact, kind);
      const files = [];
      for (const src of res.filePaths) {
        const dest = await uniqueTarget(dir, sanitize(path.basename(src)));
        await fsp.copyFile(src, dest);
        const stat = await fsp.stat(dest);
        files.push({
          name: path.basename(dest),
          path: dest,
          size: stat.size,
          addedAt: new Date().toISOString(),
        });
      }
      return { ok: true, files };
    } catch (err) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle('docs:remove', async (_e, filePath) => {
    try {
      if (filePath && fs.existsSync(filePath)) await fsp.unlink(filePath);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  });

  ipcMain.handle('docs:open', async (_e, filePath) => {
    if (!filePath || !fs.existsSync(filePath)) return { ok: false, error: 'فایل یافت نشد.' };
    const err = await shell.openPath(filePath);
    return err ? { ok: false, error: err } : { ok: true };
  });

  ipcMain.handle('docs:reveal', async (_e, { root, dateCompact, kind }) => {
    if (!root) return { ok: false, error: 'مسیر ذخیره اسناد تعیین نشده است.' };
    try {
      const dir = kind
        ? await targetDir(root, dateCompact, kind)
        : (await fsp.mkdir(path.join(root, sanitize(dateCompact)), { recursive: true }),
          path.join(root, sanitize(dateCompact)));
      const err = await shell.openPath(dir);
      return err ? { ok: false, error: err } : { ok: true };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  });

  ipcMain.handle('file:export', async (_e, { defaultName, content, filters }) => {
    const res = await dialog.showSaveDialog(mainWindow, {
      title: 'ذخیره خروجی',
      defaultPath: defaultName,
      filters: filters && filters.length ? filters : [{ name: 'CSV', extensions: ['csv'] }],
    });
    if (res.canceled || !res.filePath) return { ok: false };
    try {
      await fsp.writeFile(res.filePath, `\ufeff${content}`, 'utf8');
      return { ok: true, path: res.filePath };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  });

  ipcMain.handle('window:print', () => {
    if (mainWindow) mainWindow.webContents.print({ silent: false, printBackground: true });
    return { ok: true };
  });
}

/* --------------------------------- راه‌اندازی ------------------------------- */

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    registerAppProtocol();
    registerIpc();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
