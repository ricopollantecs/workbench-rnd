let electron = window.require('electron');
let {desktopCapturer, contextBridge, ipcRenderer} = electron;
const mergeImg = require('merge-img');
const joinImages  = require('join-images').default;; 
const sharp = require('sharp');

let os = require('os');
let path = require('path');

let fs = require('fs');
let Jimp = require('jimp');
const {google} = require('googleapis');
const { setInterval } = require('timers');

const { resolve } = require('path');

const screenshot = require('screenshot-desktop')

let {Stomp, Client} = require('@stomp/stompjs')
let SockJS = require('sockjs-client')


localStorage.setItem("hardwareInfo", "")
localStorage.setItem("softwareInfo", "")


const loginWithGoogle = async () => {
    // ipcRenderer.send('show-dashboard-view', {'test': 'test'});
    ipcRenderer.send('google-login');
}

ipcRenderer.on('update-progress', (event, value) => {
    console.log(value);
});


ipcRenderer.on('error', (event, value) => {
    console.log(value);
});



ipcRenderer.on('set_app_version', (event, value) => {
    document.getElementById('app_version').innerText = value;
});


ipcRenderer.on('connect-websocket', (event, data) => {
    let sockjs = new SockJS('https://stage-wbsocket.cloudstaff.com/ws?username=' + data + '&userId=42384&version=1.0.0');

    let client = Stomp.over(sockjs);
    
    client.connect({}, function(frame) {
        console.log('Connected: ' + frame);
    });
});


const hardwareInfoService = new InspectorService()
const backgroundService = document.getElementById("background-service")
const hardwareInfo = document.getElementById("hardware")
const softwareInfo = document.getElementById("software")
const task = document.getElementById("task")

//Cache hardware info
// const hardwareInfoCache = hardwareInfoService.getHardwareInfo()
// const softwareInfoCache = hardwareInfoService.getSoftwares()

// backgroundService.style.visibility = "visible"
hardwareInfo.style.display = "none"
softwareInfo.style.display = "none"
task.style.display = "none"



const getWebcamInterval = () => {
    var e = document.getElementById("webcam-start-interval");
    var value = e.value;
    var result = e.options[e.selectedIndex].text;
    var interval = (60000*Number(result))
    setInterval(() => {
        console.log(interval+" "+result)
        webcamCapture()
    }, interval );
}

const getScreenCaptureInterval = () => {
    var e = document.getElementById("screenshot-start-interval");
    var value = e.value;
    var result = e.options[e.selectedIndex].text;
    var interval = (60000*Number(result))
    setInterval(() => {
        console.log(interval+" "+result)
        screenCapture()
    }, interval );
}



const openCoffeeBreak = () => {
    ipcRenderer.send('open-coffee-break')
}

const openLunchBreak = () => {
    ipcRenderer.send('open-lunch-break')
}

const openMeetingBreak = () => {
    ipcRenderer.send('open-meeting-break')
}

const openBackgroundService = () => {
    backgroundService.style.display = "block"
    hardwareInfo.style.display = "none"
    softwareInfo.style.display = "none"
    task.style.display = "none"
}

const openHardwareService = async () => {
    
    // if (localStorage.getItem("hardwareInfo")==""){
    //     localStorage.setItem("hardwareInfo", "open");
    //     localStorage.setItem("softwareInfo", "");

        backgroundService.style.display = "none"
        hardwareInfo.style.display = "block"
        softwareInfo.style.display = "none"
        task.style.display = "none"


        let table = document.getElementById("hardware-table")
        let pcName = document.getElementById("pc-name")
        let operatingSystem = document.getElementById("operating-system")

        const hardwares = await hardwareInfoService.getHardwareInfo()
        pcName.innerHTML = hardwares.os
        let data = []
        data.push('<tr>' +
                '<th style="width: 250px;">Name</th>' +
                '<th>Description</th>' +
                '</tr>')
        console.log(hardwares)
        for (let i=0; i<hardwares.length; i++) {
            console.log(hardwares[i])
            data.push('<tr>' +
                '<td>' + hardwares[i].name + '</td>' +
                '<td>' + hardwares[i].description + '</td>' +
                '</tr>')
        }
        console.log(data.join(''))
        table.innerHTML = data.join('')
        pcName.innerHTML = 'PC Name: ' + os.hostname
        operatingSystem.innerHTML = 'Operating System: ' + (await hardwareInfoService.osInfo()).os

    //}
    
    
}

const openSoftwareService = async () => {

    // if (localStorage.getItem("softwareInfo")==""){
    //     localStorage.setItem("hardwareInfo", "");
    //     localStorage.setItem("softwareInfo", "open");

        backgroundService.style.display = "none"
        hardwareInfo.style.display = "none"
        softwareInfo.style.display = "block"
        task.style.display = "none"
    
        let table = document.getElementById("software-table")
        let softwares = hardwareInfoService.getSoftwares()
        console.log(softwares)
        let data = []
        data.push('<tr>' +
                '<th style="width: 250px;">Name</th>' +
                '<th style="width: 250px;">Version</th>' +
                '<th>Date Installed</th>' +
                '</tr>')
        for (let i=0; i<softwares.length; i++) {
            console.log(softwares[i])
            data.push('<tr>' +
                '<td>' + softwares[i].name + '</td>' +
                '<td>' + softwares[i].version + '</td>' +
                '<td>' + softwares[i].dateInstalled + '</td>' +
                '</tr>')
        }
        console.log(data.join(''))
        table.innerHTML = data.join('')
   // }

   
}

const openTask = async () => {
    backgroundService.style.display = "none"
    hardwareInfo.style.display = "none"
    softwareInfo.style.display = "none"
    task.style.display = "block"

}

const screenCapture = () => {

   // ipcRenderer.invoke('screenshot-capture')
    

    let filepath = path.join(os.tmpdir(), `${Date.now()}`);
    

    screenshot.all().then((imgs) => {




        joinImages(imgs,{"direction" : "horizontal"}).then((img) => {
        // Save image as file
        img.toFile(filepath+".jpg");
            console.log(filepath+".jpg")
        });

    //    mergeImg(imgs)
    //     .then((img) => {
    //       //Save image as file
    //       img.write(filepath+".jpg", (err) => { if (err) {
    //         console.error(err);
    //       }
    //       else{
    //         console.log(filepath+".jpg")
    //       }

    //       });
    //     });


   })


}

const webcamCapture = async () => {

    await navigator.getUserMedia({video: true},
        stream => {
            const mediaStreamTrack = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(mediaStreamTrack);
            imageCapture.takePhoto()
                .then(blob => {
                    blob.arrayBuffer().then(arrayBuffer => {
                        Jimp.read(Buffer.from(arrayBuffer))
                            .then((img) => {
                                const screenshotPath = path.join(os.tmpdir(), `${Date.now()}.jpg`);
                                console.log(screenshotPath)
                                img.quality(90).write(screenshotPath, () => {
                                });
                            })
                            .catch(error => console.log(error));
                        mediaStreamTrack.stop();
                    }).catch(error => {
                        console.log(error)
                        mediaStreamTrack.stop();
                    })
                })
                .catch(error => {
                    console.error('grabFrame() error:', error)
                });
        },
        error => {
            console.log(error)
        });

};


const startBreak = () => {
    console.log('start')
    let currentDate = moment()

    setInterval(() => {
        console.log(currentDate.fromNow())
    }, 1000);
}

const count = 20
let currentId = 1;
const generateTask = () => {
    let taskList = document.getElementById('taskList')
    const count = 20

    let data = []
    for (let i=0; i<count; i++) {
        const task = '<div class="" style="height: 84px; margin-bottom: 15px;border: solid; border-width: 1px;border-color: #C7C7C7; border-radius: 4px;" onclick="startTask(\'My Task ' + currentId + '\')">' +
            '<div class="flex flex-row">' +
                '<div style="margin-left: 15px; margin-top: 13px;">' +
                    '<img src="asset/icon-task-active-48x48.png" width="26" height="26" >' +
                '</div>' +
                '<div style="margin-left: 8px; margin-top: 13px;">' +
                    '<p>My Task ' + currentId + '</p>' +
                    '<p>Development</p>' +
                '</div>' +
                '<div class="grow"></div>' +
                '<div style="margin-top: 13px; margin-right: 14px;">' +
                    '<p>00:00:00</p>' +
                '</div>' +
            '</div>' +
        '</div>'
        data.push(task)
        currentId += 1
    }
    taskList.innerHTML = taskList.innerHTML + data.join('')
}

let breakInterval = null
let currentTask = document.getElementById('currentTask')
let durationLabel = document.getElementById('duration')

const startTask = (taskName) => {
    if (breakInterval != null) {
        clearInterval(breakInterval)
    }
    currentTask.innerHTML = taskName

    let startDate = moment()

    breakInterval = setInterval(() => {
        let currentDate = moment()
        let duration = moment.utc(moment.duration(currentDate.diff(startDate)).asMilliseconds()).format("HH:mm:ss")
        durationLabel.innerHTML = duration
    }, 1000);
}

generateTask()

const generateGoogleUrl = () => {
    const googleUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
        "scope=https%3A//www.googleapis.com/auth/drive.metadata.readonly&" +
        "access_type=offline&" +
        "include_granted_scopes=true&" +
        "response_type=code&" +
        "state=state_parameter_passthrough_value&" +
        "redirect_uri=http://localhost:3000&" +
        "client_id=546127601417-4bhl07gkkgb9bnl9gspgjhfjjpcm4ded.apps.googleusercontent.com"
}

console.log(generateGoogleUrl())
