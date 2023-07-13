const { app, BrowserWindow, Menu, ipcMain,contextBridge, screen, desktopCapturer} = require('electron')
const { autoUpdater } = require('electron-updater');
const path = require('path');
const os = require('os');
const mergeImg = require('merge-img');
const fs = require('fs')
const http = require('https')

const EventEmitter = require('events'); // use to create Event //Listen //Send
const loadingEvents = new EventEmitter()
const UpdateEvents = new EventEmitter()


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

    mainWindow.webContents.on('did-finish-load', () => {
        autoUpdater.checkForUpdatesAndNotify();
        mainWindow.webContents.send('check-update','checking updates....');
    });

    autoUpdater.on('update-available', () => {
        mainWindow.webContents.send('update_available');
    });

    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update_downloaded');
    });

    // autoUpdater.on('download-progress', (progressObj) => {
    //     let log_message = "Download speed: " + progressObj.bytesPerSecond;
    //     log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    //     log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    //     win.webContents.send('update_progress', log_message);
    // })

    autoUpdater.on('error', (message) => {
        console.error('There was a problem updating the application.');
        console.error(message);
        mainWindow.webContents.send('error', message);
    });
    
      ipcMain.on('restart_app', (event, data) => { //listen from renderer
        autoUpdater.quitAndInstall();
        console.log(data)
      });
    

  
  
  
}

// app.whenReady().then(() => {
//     createWindow()
// })



function createSplashScreen () {
    const win = new BrowserWindow({
      // width: 420,
      // height: 340,
      width: 400,
      height: 300,
      frame: false,
      resizable: true,
      movable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '/splash/preload.js')
      }
    })
    


    //win.webContents.openDevTools() 
    win.setMenu(null)
    win.loadFile('./splash/splash.html')

          
    loadingEvents.on('finished', () => { //Listen //event to finished
      win.close()
      createWindow()
    })

    loadingEvents.on('progress', percentage => { //Listen for progress
      //console.log(percentage);
      win.webContents.send('progress', percentage) //Send data to Renderer
  })

  
    //setTimeout(() => loadingEvents.emit('finished'), 999000)

     download('https://512pixels.net/downloads/macos-wallpapers/10-15-Day.jpg')
          // Our loadingEvents object listens for 'finished'oudstaff Wo
    return win
  }



  const download = (url, closeCallback) => {
    const file = fs.createWriteStream('big-file.jpg');

    http.get(url, function(response) {
        let total = 0;
        response.on('data', (c) => {
            total += c.length
            loadingEvents.emit('progress', total/response.headers['content-length']) // Send progress to listener
        })
        response.pipe(file)
        file.on('finish', function() {
        file.close(() => loadingEvents.emit('finished')) // Send finished event
    }).on('error', function(err) {
        fs.unlink(dest)
    })  
}
)}





app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createSplashScreen ()
    
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