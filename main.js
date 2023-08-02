const { app, BrowserWindow, Menu, ipcMain,contextBridge, screen, desktopCapturer, shell} = require('electron')
const path = require('path');
const os = require('os');
// const mergeImg = require('merge-img');
const http = require('http'); // Import Node.js core module
const https = require('https'); // Import Node.js core module
const url = require("url");
const fs = require('fs')

const { autoUpdater } = require('electron-updater');

const EventEmitter = require('events'); // use to create Event //Listen //Send
const loadingEvents = new EventEmitter()
const UpdateEvents = new EventEmitter()

const notifier = require('node-notifier'); //System notification
const crypto = require('crypto');

const screenshot = require('screenshot-desktop')




Menu.setApplicationMenu(null)

let mainWindow = null
let coffeeBreakWindow = null
let lunchBreakWindow = null
let meetingWindow = null
let screenCapturepath = null

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
        console.log("App Version: " +app.getVersion())
        mainWindow.webContents.send('set_app_version', app.getVersion())
      })


      

     
    
      
      
    autoUpdater.checkForUpdates();
    setInterval(() => {
          autoUpdater.checkForUpdates();
      }, 1800000 );

}

const createCoffeeBreakWindow = () => {
    coffeeBreakWindow = new BrowserWindow({
        width: 520,
        height: 220,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: "./preload.js"
        }
    })
    coffeeBreakWindow.loadFile('src/coffee-break.html')
}

const createLunchBreakWindow = () => {
    lunchBreakWindow = new BrowserWindow({
        width: 520,
        height: 220,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: "./preload.js"
        }
    })
    lunchBreakWindow.loadFile('src/lunch-break.html')
}

const createMeetingBreakWindow = () => {
    meetingWindow = new BrowserWindow({
        width: 520,
        height: 220,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: "./preload.js"
        }
    })
    meetingWindow.loadFile('src/meeting-break.html')
}
// app.whenReady().then(() => {
//     createWindow()
// })

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})



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

  
    //setTimeout(() => loadingEvents.emit('finished'), 5000)

     download('https://512pixels.net/wp-content/uploads/2018/09/10-7-Lion-Desktop.png')
          // Our loadingEvents object listens for 'finished'oudstaff Wo
    return win
  }



  const download = (url, closeCallback) => {
    const file = fs.createWriteStream('big-file.jpg');

    https.get(url, function(response) {
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

function getChecksum(path) {
    return new Promise((resolve, reject) => {
      // if absolutely necessary, use md5
      const hash = crypto.createHash('sha256');
      const input = fs.createReadStream(path);
      input.on('error', reject);
      input.on('data', (chunk) => {
          hash.update(chunk);
      });
      input.on('close', () => {
          resolve(hash.digest('hex'));
      });
    });
}


function install(){
    hash = crypto.createHash('md5').update(app.getVersion()).digest('hex')
    const content = 'installed';

fs.writeFile(app.getPath("temp")+'/'+hash, content, err => {
  if (err) {
    console.error(err);
  }
  // file written successfully
});

}

function checkInstall(){
    hash = crypto.createHash('md5').update(app.getVersion()).digest('hex')
    fs.readFile(app.getPath("temp")+'/'+hash, 'utf8', (err, data) => {
        if (err) {
            install()
            createSplashScreen ()
        }
        else{
            createWindow()
        }
        console.log(data);
        
      });
}


function sysPushNotif(title, message, wait, actions){
    notifier.notify(
        {
          title: title,
          message: message,
          icon: path.join(__dirname, 'src/asset/logo-about-v2.png'), // Absolute path (doesn't work on balloons)
          sound: true, // Only Notification Center or Windows Toasters
          wait: wait, // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
          action: true,
          actions: actions 
        },
        function (err, response, metadata) {
          // Response is response from notification
          // Metadata contains activationType, activationAt, deliveredAt
        }
      );
      
      
      notifier.on('restart', function (notifierObject, options) {
        // Triggers if `wait: true` and notification closes
        console.log('Restarting...')
        autoUpdater.quitAndInstall();
       

      });
}





app.whenReady().then(() => {

    
    autoUpdater.on('update-available', () => {
        sysPushNotif('Workbench Update', 'Installing...', true, [])
    });

   autoUpdater.on('update-downloaded', () => {
        sysPushNotif('Workbench Updated Successfully', 'Would you wish to restart Workbench now?', true, ['Restart', 'Cancel'])
    });


    autoUpdater.on('error', (message) => {
        console.error('There was a problem updating the application.');
        console.error(message);
        mainWindow.webContents.send('error', message);
    });

    try {
        checkInstall()
    } catch (error) {
        console.log(error)
    }

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

ipcMain.on('open-coffee-break', (event, args) => {
    createCoffeeBreakWindow()
})

ipcMain.on('open-lunch-break', (event, args) => {
    createLunchBreakWindow()
})

ipcMain.on('open-meeting-break', (event, args) => {
    createMeetingBreakWindow()
})

ipcMain.on('close-coffee-break', (event, args) => {
    coffeeBreakWindow.close()
})

ipcMain.on('close-lunch-break', (event, args) => {
    lunchBreakWindow.close()
})

ipcMain.on('close-meeting-break', (event, args) => {
    meetingWindow.close()
})


ipcMain.handle('screen-getAllDisplays', async (event, args) => {
    return screen.getAllDisplays()
})


ipcMain.handle('screenshot-capture', async (event, ...args) => {
        
    // let width = 0;
    // let height = 0;
    // for (let i = 0; i < screen.getAllDisplays().length; i++) {
    //     width += screen.getAllDisplays()[i].workArea.width;
    //     height += screen.getAllDisplays()[i].workArea.height;
    // }
    // desktopCapturer.getSources({
    //     types: ['screen'],
    //     thumbnailSize: {width: width, height: height}
    // }).then(sources => {
    //     let imgBuffers = sources
    //         .map(source => source.thumbnail.resize({width: width, height: height}))
    //         .map(source => source.toPNG());
    //     mergeImg(imgBuffers)
    //         .then((img) => {
    //             const screenshotPath = path.join(os.tmpdir(), `${Date.now()}.jpg`);
    //             console.log(screenshotPath)
    //             img.quality(90).write(screenshotPath, () => {
                    
    //             });
    //         });
    // });



})





ipcMain.on('google-login', (event, args) => {
    var server = http.createServer(function (req, res) {   //create web server
        var pathname = url.parse(req.url).pathname;
        if (pathname == '/oauth') { //check the URL of the current request
            console.log(req)
            res.writeHead(302, {
                'Location': 'https://google.com'
            });
            res.end();
            mainWindow.setSize(832, 700)
            mainWindow.loadFile('src/dashboard.html')
            mainWindow.focus()
        } else {
            res.end()
        }
    });

    server.listen(8080);

    const googleUrl = " https://accounts.google.com/o/oauth2/auth?client_id=546127601417-4bhl07gkkgb9bnl9gspgjhfjjpcm4ded.apps.googleusercontent.com&redirect_uri=http://localhost:8080/oauth&response_type=code&scope=profile%20email%20openid"
    shell.openExternal(googleUrl)
})