// main.js (Electron's main process)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let win;
let child;
let PORT;

function createWindow() {
  console.log(path.join(__dirname, 'preload.js'))
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:3000'); // Load React app
  win.on('closed', () => {
    win = null;
  });
}

function generateRandomPort() {
  const min = 1024;
  const max = 65535;
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

  var tempPort = generateRandomPort()
  PORT = tempPort

  child = spawn('node', ['server/index.js', tempPort])
  
  child.stdout.on('data', (data) => {
    const logMessage = data.toString();
    console.log(`Child stdout: ${logMessage}`);
    // Chnage this to process messages from server
    try{
      const parsedMessage = JSON.parse(logMessage)
      if(parsedMessage){
        win.webContents.send('from-main', logMessage);
      }else{
        win.webContents.send('log-message', logMessage);
      }
    }catch(_){
      win.webContents.send('log-message', logMessage);
    }   
  });

  child.stderr.on('data', (data) => {
    const errorMessage = data.toString();
    console.error(`Child stderr: ${errorMessage}`);
    win.webContents.send('log-message', `Error: ${errorMessage}`);
  });

  child.on('close', () => {
    console.log(`Child process exited.`);
    event.reply('log-message', `Child process exited.`);
    child = null;
  });

  child.on('exit', () => {
    child = null;
  });

  PORT = tempPort
});

ipcMain.on('kill-server', () => {
  if (child) {
    child.kill('SIGINT');
    child = null;
  }
});

ipcMain.on('send-to-main', (event, arg) => {
  event.reply('from-main', arg);
});

ipcMain.handle('get-server-port', () => {
  return PORT
})
