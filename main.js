/**
 * Sr Lakes — Stage Sync
 * Electron wrapper: sobe o servidor e abre a janela apontando pro localhost.
 */
const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let serverModule = null;

function startServer() {
  if (serverModule) return;
  try {
    serverModule = require('./server.js');
  } catch (e) {
    dialog.showErrorBox('Erro ao iniciar servidor', e.message);
    throw e;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 920,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#04060b',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Espera o servidor estar de pé
  const PORT = process.env.PORT || 7474;
  const url = `http://localhost:${PORT}`;
  const tryLoad = (attempt = 0) => {
    mainWindow.loadURL(url).catch(() => {
      if (attempt < 20) setTimeout(() => tryLoad(attempt + 1), 200);
      else dialog.showErrorBox('Erro', 'Servidor não respondeu em ' + url);
    });
  };
  tryLoad();

  // Links externos abrem no navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Menu mínimo (Ctrl+R pra recarregar, F12 devtools, F11 fullscreen)
const template = [
  {
    label: 'Arquivo',
    submenu: [
      { label: 'Tela cheia', accelerator: 'F11', click: () => mainWindow && mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
      { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
      { type: 'separator' },
      { label: 'Sair', accelerator: 'CmdOrCtrl+Q', role: 'quit' },
    ],
  },
  {
    label: 'Visualizar',
    submenu: [
      { label: 'DevTools', accelerator: 'F12', role: 'toggleDevTools' },
      { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', role: 'zoomIn' },
      { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
      { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
    ],
  },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  startServer();
  // Pequeno delay pra garantir que o servidor está ouvindo
  setTimeout(createWindow, 400);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
