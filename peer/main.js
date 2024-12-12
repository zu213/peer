// main.js (Electron's main process)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let win;
let child;

function createWindow() {
  console.log(path.join(__dirname, 'preload.js'))
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Correct path to the preload script
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:3000'); // Load React app
  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
  if (child) child.kill('SIGINT');
});

ipcMain.on('start-server', (event) => {
  // Start backend
  child = exec('node server/index.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      event.reply('from-main', error);
      return;
    }
    console.log(`stdout: ${stdout}`);
    event.reply('from-main', stdout);
    console.error(`stderr: ${stderr}`);
    event.reply('from-main', stderr);

  });

});

ipcMain.on('kill-server', (event) => {
  if (child) child.kill('SIGINT');
});

ipcMain.on('send-to-main', (event, arg) => {
  console.log('Received event from React:', arg); // arg is the data sent from React
  // You can send a response back if needed
  event.reply('from-main', 'Hello from Main!');
});
