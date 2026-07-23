const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const net = require('net');

let mainWindow;

// Handle LAN printer scanning in Electron main process
ipcMain.handle('scan-lan-printers', async () => {
  try {
    const interfaces = os.networkInterfaces();
    const subnets = [];

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (!iface.internal && iface.family === 'IPv4') {
          const parts = iface.address.split('.');
          if (parts.length === 4) {
            subnets.push(`${parts[0]}.${parts[1]}.${parts[2]}`);
          }
        }
      }
    }

    const uniqueSubnets = Array.from(new Set(subnets));
    if (uniqueSubnets.length === 0) {
      uniqueSubnets.push('192.168.1', '192.168.0', '192.168.8', '192.168.31');
    }

    const pingPort = (ip, port = 9100, timeout = 300) => {
      return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(timeout);
        socket.on('connect', () => {
          socket.destroy();
          resolve(true);
        });
        socket.on('timeout', () => {
          socket.destroy();
          resolve(false);
        });
        socket.on('error', () => {
          socket.destroy();
          resolve(false);
        });
        socket.connect(port, ip);
      });
    };

    const foundPrinters = [];

    for (const subnet of uniqueSubnets) {
      const ips = Array.from({ length: 254 }, (_, i) => `${subnet}.${i + 1}`);
      const batchSize = 35;

      for (let i = 0; i < ips.length; i += batchSize) {
        const batch = ips.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (ip) => {
            const isOpen = await pingPort(ip, 9100, 300);
            return isOpen ? { ip, port: 9100, status: 'Online' } : null;
          })
        );
        for (const item of results) {
          if (item) foundPrinters.push(item);
        }
      }
    }

    return { success: true, count: foundPrinters.length, printers: foundPrinters };
  } catch (err) {
    console.error('Electron LAN scan error:', err);
    return { success: false, error: err.message, printers: [] };
  }
});

// Handle LAN printer test print in Electron main process
ipcMain.handle('test-lan-printer', async (event, { ip, port = 9100 }) => {
  return new Promise((resolve) => {
    if (!ip) return resolve({ success: false, error: 'IP manzil kiritilmadi' });

    const socket = new net.Socket();
    socket.setTimeout(2500);

    socket.on('connect', () => {
      const testBuffer = Buffer.from(
        '\x1b\x40' + // Init
        '\x1b\x61\x01' + // Center
        '\x1b\x45\x01' + // Bold ON
        'OHLALA POS - LAN TEST\n' +
        '\x1b\x45\x00' + // Bold OFF
        'IP: ' + ip + '\n' +
        'Ethernet ulanishi muvaffaqiyatli!\n\n\n' +
        '\x1d\x56\x41\x03', // Cut
        'raw'
      );
      socket.write(testBuffer, () => {
        socket.destroy();
        resolve({ success: true, message: `LAN Printer (${ip}:${port}) muvaffaqiyatli ulandi va sinov cheki chop etildi!` });
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, error: `Printer javob bermadi (${ip}:${port}). IP manzil va printer yoqilganini tekshiring.` });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ success: false, error: `Ulanishda xatolik: ${err.message || 'Printer bilan bog\'lanib bo\'lmadi'}` });
    });

    socket.connect(port, ip);
  });
});


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
