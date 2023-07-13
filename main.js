const { app, BrowserWindow, Menu, ipcMain,contextBridge, screen, desktopCapturer} = require('electron')
const { autoUpdater } = require('electron-updater');
const path = require('path');
const os = require('os');
const mergeImg = require('merge-img');


Menu.setApplicationMenu(null)

let mainWindow = null
let dashboardWindow = null

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: "./preload.js"
        }
    })
    mainWindow.loadFile('src/index.html')
    mainWindow.webContents.openDevTools({mode: 'detach'})
    
    mainWindow.webContents.on('did-finish-load', ()=>{
        mainWindow.webContents.send('set_app_version', app.getVersion());
      })

    mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
    });

    autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
    });

    autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
    });

    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        win.webContents.send('update_progress', log_message);
    })
    
      ipcMain.on('restart_app', (event, data) => { //listen from renderer
        autoUpdater.quitAndInstall();
        console.log(data)
      });
    

  
  
  
}

// app.whenReady().then(() => {
//     createWindow()
// })

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

ipcMain.on('show-dashboard-view', (event, args) => {
    console.log('load dashboard')
    console.log(args)
    mainWindow.setSize(832, 700)
    mainWindow.loadFile('src/dashboard.html')
    // createDashboardWindow()
})


ipcMain.on('screen-getAllDisplayes', (event, args) => {
    console.log('load dashboard')
    console.log(args)
    mainWindow.setSize(832, 700)
    mainWindow.loadFile('src/dashboard.html')
    // createDashboardWindow()
})

ipcMain.handle('screen-getAllDisplays', async (event, args) => {
    return screen.getAllDisplays()
})

ipcMain.handle('screenshot-capture', async (event, ...args) => {
        
    let width = 0;
    let height = 0;
    for (let i = 0; i < screen.getAllDisplays().length; i++) {
        width += screen.getAllDisplays()[i].workArea.width;
        height += screen.getAllDisplays()[i].workArea.height;
    }
    desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {width: width, height: height}
    }).then(sources => {
        let imgBuffers = sources
            .map(source => source.thumbnail.resize({width: width, height: height}))
            .map(source => source.toPNG());
        mergeImg(imgBuffers)
            .then((img) => {
                const screenshotPath = path.join(os.tmpdir(), `${Date.now()}.jpg`);
                console.log(screenshotPath)
                img.quality(90).write(screenshotPath, () => {
                    
                });
            });
    });
})