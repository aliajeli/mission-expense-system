'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  load: () => ipcRenderer.invoke('data:load'),
  save: (data) => ipcRenderer.invoke('data:save', data),
  chooseFolder: () => ipcRenderer.invoke('dialog:folder'),
  pickDocs: (payload) => ipcRenderer.invoke('docs:pick', payload),
  removeDoc: (filePath) => ipcRenderer.invoke('docs:remove', filePath),
  openPath: (filePath) => ipcRenderer.invoke('docs:open', filePath),
  revealFolder: (payload) => ipcRenderer.invoke('docs:reveal', payload),
  exportFile: (payload) => ipcRenderer.invoke('file:export', payload),
  info: () => ipcRenderer.invoke('app:info'),
  print: () => ipcRenderer.invoke('window:print'),
});
