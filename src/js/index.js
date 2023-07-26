let electron = window.require('electron');
let {desktopCapturer, contextBridge, ipcRenderer} = electron;

let os = require('os');
let path = require('path');
let mergeImg = require('merge-img');

let fs = require('fs');
let Jimp = require('jimp');
const {google} = require('googleapis');
const { setInterval } = require('timers');

const NodeWebcam = require( "node-webcam" );
const { resolve } = require('path');


const loginWithGoogle = async () => {
    // ipcRenderer.send('show-dashboard-view', {'test': 'test'});
    ipcRenderer.send('google-login');
}


ipcRenderer.on('set_app_version', (event, value) => {
    document.getElementById('app_version').innerText = value;
});


const hardwareInfoService = new InspectorService()
const backgroundService = document.getElementById("background-service")
const hardwareInfo = document.getElementById("hardware")
const softwareInfo = document.getElementById("software")
const task = document.getElementById("task")


// backgroundService.style.visibility = "visible"
hardwareInfo.style.display = "none"
softwareInfo.style.display = "none"
task.style.display = "none"




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
}

const openSoftwareService = async () => {
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
}

const openTask = async () => {
    backgroundService.style.display = "none"
    hardwareInfo.style.display = "none"
    softwareInfo.style.display = "none"
    task.style.display = "block"

}

const screenCapture = () => {
    ipcRenderer.invoke('screenshot-capture')
}

const webcamCapture = async () => {

    // await navigator.getUserMedia({video: true},
    //     stream => {
    //         const mediaStreamTrack = stream.getVideoTracks()[0];
    //         const imageCapture = new ImageCapture(mediaStreamTrack);
    //         imageCapture.takePhoto()
    //             .then(blob => {
    //                 blob.arrayBuffer().then(arrayBuffer => {
    //                     Jimp.read(Buffer.from(arrayBuffer))
    //                         .then((img) => {
    //                             const screenshotPath = path.join(os.tmpdir(), `${Date.now()}.jpg`);
    //                             console.log(screenshotPath)
    //                             img.quality(90).write(screenshotPath, () => {
    //                             });
    //                         })
    //                         .catch(error => console.log(error));
    //                     mediaStreamTrack.stop();
    //                 }).catch(error => {
    //                     console.log(error)
    //                     mediaStreamTrack.stop();
    //                 })
    //             })
    //             .catch(error => {
    //                 console.error('grabFrame() error:', error)
    //             });
    //     },
    //     error => {
    //         console.log(error)
    //     });

    


    //Default options

    var opts = {

        //Picture related

        width: 1280,

        height: 720,

        quality: 100,

        // Number of frames to capture
        // More the frames, longer it takes to capture
        // Use higher framerate for quality. Ex: 60

        frames: 60,


        //Delay in seconds to take shot
        //if the platform supports miliseconds
        //use a float (0.1)
        //Currently only on windows

        delay: 0,


        //Save shots in memory

        saveShots: true,


        // [jpeg, png] support varies
        // Webcam.OutputTypes

        output: "jpeg",


        //Which camera to use
        //Use Webcam.list() for results
        //false for default device

        device: false,


        // [location, buffer, base64]
        // Webcam.CallbackReturnTypes

        callbackReturn: "location",


        //Logging

        verbose: true

    };


    //Creates webcam instance

    var Webcam = NodeWebcam.create( opts );


    // //Will automatically append location output type

    // Webcam.capture( "test_picture", function( err, data ) {} );


    //Also available for quick use

    NodeWebcam.capture( os.tmpdir()+"/"+"test_picture", opts, function( err, data ) {
        console.log(data)
        // fs.writeFile('img/'+Date.now()+'.jpg', data, err => {
        //     if (err) {
        //       console.error(err);
        //     }
        //     // file written successfully
        //   });


    });


}

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
