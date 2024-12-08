const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer (React)
contextBridge.exposeInMainWorld('electronAPI', {
  startServer: () => ipcRenderer.send('start-server')
});