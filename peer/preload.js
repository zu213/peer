const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  startServer: () => ipcRenderer.send('start-server'),
  killServer: () => ipcRenderer.send('kill-server'),
  sendToMain: (data) => ipcRenderer.send('send-to-main', data), // Send event to main process
  onFromMain: (callback) => ipcRenderer.on('from-main', callback), // Listen for response from main process
  receiveLog: (callback) => ipcRenderer.on('log-message', callback),
  removeListener: (event) => ipcRenderer.removeAllListeners(event),
});

console.log('Preload complete')