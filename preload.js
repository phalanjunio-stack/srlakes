/**
 * Preload — expõe pequenas APIs seguras pro frontend (se precisar)
 */
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('stageSync', {
  isElectron: true,
  platform: process.platform,
});
