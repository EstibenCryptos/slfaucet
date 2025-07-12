const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 850,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
    title: 'SL Faucet - 1v alpha',
  });

  win.loadFile('index.html');
}

function openConfigWindow(folder) {
  const configWin = new BrowserWindow({
    width: 400,
    height: 600,
    parent: BrowserWindow.getFocusedWindow(),
    modal: true,
    title: `Configurações - ${folder}`,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  configWin.loadFile('config.html');
  configWin.webContents.once('did-finish-load', () => {
    configWin.webContents.send('load-config', folder);
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('read-folders', () => {
  const dir = path.join(__dirname, 'dados');
  return fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());
});

ipcMain.handle('read-info', (event, folder) => {
  const filePath = path.join(__dirname, 'dados', folder, 'info.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  return json;
});

ipcMain.on('open-config', (event, folder) => {
  openConfigWindow(folder);
});

ipcMain.handle('read-config', (event, folder) => {
  const configPath = path.join(__dirname, 'dados', folder, 'config.json');
  if (!fs.existsSync(configPath)) return { ui: {}, system: {} };
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
});

ipcMain.handle('write-config', (event, folder, newUIConfig) => {
  const configPath = path.join(__dirname, 'dados', folder, 'config.json');
  let existing = { ui: {}, system: {} };
  if (fs.existsSync(configPath)) {
    existing = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  existing.ui = newUIConfig;
  fs.writeFileSync(configPath, JSON.stringify(existing, null, 2));
});
