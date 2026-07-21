const { app, BrowserWindow, globalShortcut, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createMenu() {
  const template = [
    {
      label: 'Application',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'CommandOrControl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function registerShortcuts() {
  const shortcuts = ['CommandOrControl+Q', 'Control+Q', 'Command+Q', 'Control+Shift+Q'];
  
  shortcuts.forEach(shortcut => {
    try {
      globalShortcut.register(shortcut, () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.close();
        }
        app.quit();
      });
    } catch (err) {
      console.warn(`Failed to register shortcut: ${shortcut}`, err);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    fullscreen: false,
    kiosk: false,
    minimizable: true,
    resizable: true,
    autoHideMenuBar: true, // Clean look for kitchen screens
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'public/vite.svg') // Fallback icon
  });

  mainWindow.maximize();

  // Listen for keydown events inside the renderer process window
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      const isControlOrCmd = input.control || input.meta;
      if (isControlOrCmd && input.key.toLowerCase() === 'q') {
        event.preventDefault();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.close();
        }
        app.quit();
      }
    }
  });

  mainWindow.once('ready-to-show', () => {
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

app.on('ready', () => {
  createMenu();
  createWindow();
  registerShortcuts();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

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

