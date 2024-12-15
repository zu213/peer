// main.js (Electron's main process)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

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
  if (child) {
    child.kill('SIGINT');
    child = null;
  }
});

ipcMain.on('start-server', (event) => {
  // Start backend
  if(child) {
    console.error('Child server already exists!!')
    event.reply('from-main', `Child server already exists!!`);
    return
  }

  child = spawn('node', ['server/index.js'])
  
  child.stdout.on('data', (data) => {
    const logMessage = data.toString();
    console.log(`Child stdout: ${logMessage}`); 
    win.webContents.send('log-message', logMessage);
  });

  child.stderr.on('data', (data) => {
    const errorMessage = data.toString();
    console.error(`Child stderr: ${errorMessage}`);
    win.webContents.send('log-message', `Error: ${errorMessage}`);
  });

  child.on('close', () => {
    console.log(`Child process exited.`);
    event.reply('from-main', `Child process exited.`);
    child = null;
  });

  child.on('exit', () => {
    console.log(`Child process exited.`);
    event.reply('from-main', `Child process exited.`);
    child = null;
  });

});

ipcMain.on('kill-server', () => {
  if (child) {
    child.kill('SIGINT');
    child = null;
  }
});

ipcMain.on('send-to-main', (event, arg) => {
  // generic tempalte for call and response messages
  console.log('Received event from React:', arg);
  event.reply('from-main', arg);
});
