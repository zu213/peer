// main.js (Electron's main process)
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Allow React to use Node.js modules
    },
  });

  win.loadURL('http://localhost:3000'); // Load React app
  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  console.log('aa')

  createWindow();

  console.log('aa')
  // Start your backend server here
  exec('node server/index.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  console.log('aa')

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});