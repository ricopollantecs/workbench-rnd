const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    handleUpdate: (callback) => ipcRenderer.on('progress', callback)
})