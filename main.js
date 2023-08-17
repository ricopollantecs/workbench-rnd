const { app, BrowserWindow, Menu, ipcMain,contextBridge, screen, desktopCapturer, shell, Notification,net, protocol, session, dialog} = require('electron')
const path = require('path');
const os = require('os');
// const mergeImg = require('merge-img');
const http = require('http'); // Import Node.js core module
const https = require('https'); // Import Node.js core module
const url = require("url");
const fs = require('fs')
const log = require('electron-log');

const { autoUpdater } = require('electron-updater');

const EventEmitter = require('events'); // use to create Event //Listen //Send
const loadingEvents = new EventEmitter()
const UpdateEvents = new EventEmitter()

const notifier = require('node-notifier'); //System notification
const crypto = require('crypto');

const screenshot = require('screenshot-desktop')

const fetch = require('node-fetch');




Menu.setApplicationMenu(null)

let mainWindow = null
let coffeeBreakWindow = null
let lunchBreakWindow = null
let meetingWindow = null
let screenCapturepath = null

let dashboardWindow = null

const createWindow = () => {

    if (process.defaultApp) {
        if (process.argv.length >= 2) {
          app.setAsDefaultProtocolClient('electron-fiddle', process.execPath, [path.resolve(process.argv[1])])
        }
      } else {
        app.setAsDefaultProtocolClient('electron-fiddle')
      }

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
    mainWindow.webContents.openDevTools()

    
    mainWindow.webContents.on('did-finish-load', ()=>{
        console.log("App Version: " +app.getVersion())
        mainWindow.webContents.send('set_app_version', app.getVersion())
      })

    mainWindow.webContents.on('focus', ()=>{
        console.log("App Version: " +app.getVersion())
        mainWindow.webContents.send('set_app_version', app.getVersion())
      })
      
      
      console.log(Object.keys(app._events))


      app.on('web-contents-created', (event, url) => {
        console.log('web-contents-created opened...')
        dialog.showErrorBox('Welcome Back', `You arrived from: web-contents-created ${url}`)
      })

      app.on('activate', (event, url) => {
        console.log('activate opened...')
        dialog.showErrorBox('Welcome Back', `You arrived from: activate ${url}`)
      })
      
      app.on('open-url', (event, url) => {
        console.log('open-url opened...')
        dialog.showErrorBox('Welcome Back', `You arrived from: open-url ${url}`)
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
          actions: actions,
          timeout: 9999999999
        },
        function (err, response, metadata) {
          // Response is response from notification
          // Metadata contains activationType, activationAt, deliveredAt
        }
      );
      
      notifier.on('test action', function (notifierObject, options) {
        // Triggers if `wait: true` and notification closes
        mainWindow.webContents.send('update-progress', "action started....");

      });
      
      notifier.on('restart', function (notifierObject, options) {
        // Triggers if `wait: true` and notification closes
        mainWindow.webContents.send('update-progress', "Restarting......");
        autoUpdater.quitAndInstall(true, true);
       

      });

      notifier.on('yes', function (notifierObject, options) {
        // Triggers if `wait: true` and notification closes
        console.log('Restarting...')
      });

      


}

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "debug";
autoUpdater.autoDownload = false

let myWindow = null
    
const gotTheLock = app.requestSingleInstanceLock()
    
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    autoUpdater.autoDownload = true
    autoUpdater.on('update-available', (progress) => {
        sysPushNotif('Workbench Update', 'Installing update....', true, [])
        mainWindow.webContents.send('update-progress', Object.keys(autoUpdater._events));
    });
    autoUpdater.checkForUpdates();
    // Someone tried to run a second instance, we should focus our window.
    if (myWindow) {
      if (myWindow.isMinimized()) myWindow.restore()
      myWindow.focus()
      
    }
  })
    
  // Create myWindow, load the rest of the app, etc...
  app.whenReady().then(() => {

        autoUpdater.on('download-progress',  (progress) => {
            mainWindow.webContents.send('update-progress', "Progress: "+ progress.percent+"%");
            
        });
                       
    
        autoUpdater.once('update-available', () => {
            // sysPushNotif('Workbench Update', 'Would you like to update?', true, ['Yes', 'No'])
                const options = {
                    title: "Workbench Update",
                    message: "Update downloaded successfully. Would you like to relaunch now?",
                    button: [
                    { text: "Relaunch", onClick: 'electron-fiddle://' },
                    { text: "Not now", onClick: "none" }
                    ]
                };
                
                const toastXmlString = `<?xml version="1.0" encoding="UTF-8"?>
                <toast activationType="protocol" scenario="default" launch="" duration="Short">
                    <visual>
                        <binding template="ToastGeneric">
                        <image placement="appLogoOverride" src="" hint-crop="none" />
                        <image placement="hero" src="" />
                        <text><![CDATA[Workbench Update]]></text>
                        <text><![CDATA[Update downloaded successfully. Would you like to relaunch now?]]></text>
                        <text placement="attribution" />
                        <image src="" />
                        </binding>
                    </visual>
                    <actions>
                        <action content="Relaunch" placement="" imageUri="" arguments="electron-fiddle://" activationType="protocol" />
                        <action content="Not now" placement="" imageUri="" arguments="none" activationType="protocol" />
                    </actions>
                    <audio silent="false" />
                </toast>`
                console.log(toastXmlString)
                const toast = new Notification({toastXml: toastXmlString});
                
                toast.show();  

        });
    
       autoUpdater.on('update-downloaded', (info) => {
            sysPushNotif('Workbench Updated Successfully', 'Would you wish to restart Workbench now?', true, ['Restart', 'Cancel'])
            mainWindow.webContents.send('update-progress', info);
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
}



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
            const client_id =''
            const queryObject = url.parse(req.url, true).query
            let data = new URLSearchParams({
                client_id: '546127601417-4bhl07gkkgb9bnl9gspgjhfjjpcm4ded.apps.googleusercontent.com',
                client_secret: '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',
                code: queryObject['code'],
                redirect_uri: 'http://localhost:3000/oauth',
                grant_type: 'authorization_code',
            })
            fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                body: data,
            })
            .then(res => res.json())
            .then(json => {
                console.log(json)
                const access_token = json['access_token']
                fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                })
                .then(res => res.json())
                .then(json => {
                    console.log(json)
                    res.writeHead(302, {
                        'Location': 'https://google.com'
                    });
                    res.end();
                    mainWindow.setSize(832, 700)
                    mainWindow.once('ready-to-show', () => {
                        mainWindow.show()
                        mainWindow.focus()
                        mainWindow.webContents.send('connect-websocket', json['email'])
                        
                    })
                    mainWindow.loadFile('src/dashboard.html')
                })
            })
        } else {
            res.end()
        }
    });

    server.listen(3000);

    const googleUrl = "https://accounts.google.com/o/oauth2/auth?client_id=546127601417-4bhl07gkkgb9bnl9gspgjhfjjpcm4ded.apps.googleusercontent.com&redirect_uri=http://localhost:3000/oauth&response_type=code&scope=profile%20email%20openid"
    shell.openExternal(googleUrl)
})