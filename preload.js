const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ieltsApp', {
  keyStatus: () => ipcRenderer.invoke('key:status'),
  saveKey: key => ipcRenderer.invoke('key:save', key),
  deleteKey: () => ipcRenderer.invoke('key:delete'),
  grade: prompt => ipcRenderer.invoke('claude:grade', prompt),
  about: () => ipcRenderer.invoke('app:about')
});
