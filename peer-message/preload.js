const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  startServer: () => ipcRenderer.send('start-server'),
  getServerPort: () => ipcRenderer.invoke('get-server-port'),
  killServer: () => ipcRenderer.send('kill-server'),
  sendToMain: (data) => ipcRenderer.send('send-to-main', data), // Send data to server
  onFromMain: (callback) => ipcRenderer.on('from-main', callback), // Listen for response from server
  receiveLog: (callback) => ipcRenderer.on('log-message', callback),
  removeListener: (event) => ipcRenderer.removeAllListeners(event),
});

console.log('Preload complete')