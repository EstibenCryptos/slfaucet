const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readFolders: () => ipcRenderer.invoke('read-folders'),
  readInfo: (folderName) => ipcRenderer.invoke('read-info', folderName),
  openConfig: (folder) => ipcRenderer.send('open-config', folder),
  readConfig: (folder) => ipcRenderer.invoke('read-config', folder),
  writeConfig: (folder, config) => ipcRenderer.invoke('write-config', folder, config),
  onLoadConfig: (callback) => ipcRenderer.on('load-config', (event, folder) => callback(folder)),
});
