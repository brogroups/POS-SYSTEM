const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createMenu() {
  const isMac = process.platform === 'darwin';
  
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit', label: 'Chiqish (Quit)' }
      ]
    }] : []),
    {
      label: 'Fayl',
      submenu: [
        {
          label: 'Qayta yuklash (Reload)',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.reload();
          }
        },
        {
          label: 'Qattiq Qayta yuklash (Force Reload)',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Ilovani Qayta Ishga Tushirish (Restart App)',
          accelerator: 'CmdOrCtrl+Shift+K',
          click: () => {
            app.relaunch();
            app.exit(0);
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', label: 'Chiqish (Quit)' }
      ]
    },
    {
      label: 'Tahrirlash (Edit)',
      submenu: [
        { role: 'undo', label: 'Bekor qilish (Undo)' },
        { role: 'redo', label: 'Qaytarish (Redo)' },
        { type: 'separator' },
        { role: 'cut', label: 'Kesib olish (Cut)' },
        { role: 'copy', label: 'Nusxalash (Copy)' },
        { role: 'paste', label: 'Joylashtirish (Paste)' },
        { role: 'selectAll', label: 'Barchasini tanlash (Select All)' }
      ]
    },
    {
      label: 'Ko\'rinish (View)',
      submenu: [
        { role: 'reload', label: 'Qayta yuklash' },
        { role: 'forceReload', label: 'Qattiq qayta yuklash' },
        { role: 'toggleDevTools', label: 'Dasturchi Asboblari (DevTools)', accelerator: 'F12' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Masshtabni tiklash' },
        { role: 'zoomIn', label: 'Kattalashtirish' },
        { role: 'zoomOut', label: 'Kichiklashtirish' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'To\'liq ekran (Fullscreen)', accelerator: 'F11' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    fullscreen: true,
    fullscreenable: true,
    kiosk: false,
    minimizable: true,
    resizable: true,
    autoHideMenuBar: false, // Standard menu bar enabled for keyboard shortcuts
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'public/vite.svg') // Fallback icon
  });

  mainWindow.maximize();
  mainWindow.setFullScreen(true);

  // Listen for keydown events inside the renderer process window
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      const isControlOrCmd = input.control || input.meta;
      const key = input.key.toLowerCase();

      // Ctrl+R, Cmd+R, or F5 -> Reload page
      if ((isControlOrCmd && key === 'r') || input.key === 'F5') {
        event.preventDefault();
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (input.shift) {
            mainWindow.webContents.reloadIgnoringCache();
          } else {
            mainWindow.webContents.reload();
          }
        }
        return;
      }

      // F12 or Ctrl+Shift+I / Cmd+Option+I -> Toggle DevTools
      if (input.key === 'F12' || (isControlOrCmd && input.shift && key === 'i')) {
        event.preventDefault();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.toggleDevTools();
        }
        return;
      }

      // Ctrl+Shift+R or Ctrl+F5 -> Force reload
      if ((isControlOrCmd && input.shift && key === 'r') || (input.control && input.key === 'F5')) {
        event.preventDefault();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.reloadIgnoringCache();
        }
        return;
      }

      // Ctrl+Shift+K -> Restart whole app
      if (isControlOrCmd && input.shift && key === 'k') {
        event.preventDefault();
        app.relaunch();
        app.exit(0);
        return;
      }

      // Ctrl+Q or Cmd+Q -> Quit app
      if (isControlOrCmd && key === 'q') {
        event.preventDefault();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.close();
        }
        app.quit();
      }
    }
  });

  // Prevent opening new windows or tabs — keep all navigation inside the single window
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.setFullScreen(true);
    mainWindow.show();
  });

  const devUrl = 'http://127.0.0.1:5173';
  const localFile = path.join(__dirname, 'dist/index.html');

  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  if (isDev) {
    mainWindow.loadURL(devUrl).catch(() => {
      console.log('Dev server not available, loading production dist/index.html...');
      mainWindow.loadFile(localFile).catch(err => console.error('Failed to load local file:', err));
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(localFile).catch(err => {
      console.error('Failed to load dist/index.html:', err);
      mainWindow.loadURL(devUrl).catch(e => console.error('Failed to load devUrl fallback:', e));
    });
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('ready', () => {
    createMenu();
    createWindow();
  });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
