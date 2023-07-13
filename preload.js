const {contextBridge, screen, desktopCapturer} = require('electron')

contextBridge.exposeInMainWorld(
    'electron', {
        screenAllDisplays: () => {
            return screen.getAllDisplays()
        }
    }
)