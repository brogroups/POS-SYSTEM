const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron environment initialized');
});

contextBridge.exposeInMainWorld('electronAPI', {
  scanLanPrinters: () => ipcRenderer.invoke('scan-lan-printers'),
  testLanPrinter: (params) => ipcRenderer.invoke('test-lan-printer', params)
});

