let electron = window.require('electron');
let {desktopCapturer, contextBridge, ipcRenderer} = electron;

let si = require('systeminformation');
let moment = require('moment');
let os = require('os');

let path = require('path');
let mergeImg = require('merge-img');

let fs = require('fs');
let Jimp = require('jimp');

const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');




ipcRenderer.on('set_app_version', (event, value) => {
    document.getElementById('app_version').innerText = value;
});

// ipcRenderer.on('check-update', (event, value) => {
//    console.log(value)
// });

ipcRenderer.on('error', (event, value) => {
    console.log(value)
 });
 

ipcRenderer.on('set_app_version', (event, value) => {
    document.getElementById('app_version').innerText = value;
});

ipcRenderer.on('update_available', () => {
    message.innerText = 'A new update is available. Downloading now...';
    notification.classList.remove('hidden');
    console.log('Update available')
});

ipcRenderer.on('update_downloaded', () => {
message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
  restartButton.classList.remove('hidden');
  notification.classList.remove('hidden');
  console.log('Update downloaded')
});

function closeNotification() {
    notification.classList.add('hidden');
  }

  function restartApp() {
   // window.electronAPI.handleRestartApp('restart app...')
     //send data to main
     ipcRenderer.send('restart_app', 'restarting app...');
  }
  





class ScreeCapture {

    constructor () {
        this.worker = null;
        this.interval = 0;
        this.status = false;
        this.screen = screen;
        console.log(screen)
        console.log(window.electron)
    }

    async getScreenSize() {
        const displays = await ipcRenderer.invoke('screen-getAllDisplays')
        
        let width = 0;
        let height = 0;
        for (let i = 0; i < displays.length; i++) {
            width += displays[i].workArea.width;
            height += displays[i].workArea.height;
        }

        return {
            width: width,
            height: height
        }
    }

    async capture() {
        console.log('start screen capture');
        const {width, height} = await this.getScreenSize();
        const desktopCapturer = await ipcRenderer.invoke('desktopCapturer-getSources', width.toString(), height.toString())
        console.log(desktopCapturer)
        desktopCapturer.then(sources => {
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
    }
}

class HardwareInformation {

    constructor() {
        this.worker = null;
        this.interval = 0;
        this.status = false;
        this.softwares = [];
    }

    async hardwareInfo() {
        let hardware = [];
        hardware.push(await si.system());
        // hardware.push(await si.cpu());
        // hardware.push(await si.mem());
        // hardware.push(await si.battery());
        // hardware.push(await si.graphics());
        hardware.push(await si.osInfo());
        // hardware.push(await si.diskLayout());
        // hardware.push(await si.networkInterfaces());
        return hardware;
    }

    async osInfo() {
        const osInfo = await si.osInfo();
        return {
            os: osInfo.distro + ' ' + osInfo.codename,
            osVersion: osInfo.release
        }
    }

    async graphics() {
        const graphicsData = await si.graphics();
        console.log('graphics')
        console.log(graphicsData)

        let graphicsArr = [];
        for (let i = 0; i < graphicsData.controllers.length; i++) {
            graphicsArr.push(graphicsData.controllers[i].vendor + ' ' + graphicsData.controllers[i].model + ' ' + graphicsData.controllers[i].vram);
        }
        if (graphicsArr.length === 0) {
            return 'N/A';
        } else {
            return graphicsArr.join(', ');
        }
    }

    async monitors() {
        const graphicsData = await si.graphics();
        console.log('monitors')
        console.log(graphicsData)
        let displays = [];
        for (let i = 0; i < graphicsData.displays.length; i++) {
            displays.push(graphicsData.displays[i].vendor + ' ' + graphicsData.displays[i].model + ' ' + graphicsData.displays[i].vram);
        }
        if (displays.length === 0) {
            return 'N/A';
        } else {
            return displays.join(', ');
        }
    }

    async usb() {
        const graphicsData = await si.usb();
        console.log('usb')
        console.log(graphicsData)
        let usbs = [];
        for (let i = 0; i < graphicsData.length; i++) {
            if (graphicsData[i].type.toLowerCase() !== 'keyboard' || graphicsData[i].type.toLowerCase() !== 'mouse') {
                continue;
            }
            usbs.push(graphicsData[i].name);
        }
        if (usbs.length === 0) {
            return 'N/A';
        } else {
            return usbs.join(', ');
        }
    }

    async keyboard() {
        const graphicsData = await si.usb();
        console.log('keyboard')
        console.log(graphicsData)
        let usbs = [];
        for (let i = 0; i < graphicsData.length; i++) {
            if (graphicsData[i].type.toLowerCase() === 'keyboard') {
                usbs.push(graphicsData[i].name);
                break
            }
        }
        if (usbs.length === 0) {
            return 'N/A';
        } else {
            return usbs[0];
        }
    }

    async mouse() {
        const graphicsData = await si.usb();
        console.log('mouse')
        console.log(graphicsData)
        let usbs = [];
        for (let i = 0; i < graphicsData.length; i++) {
            if (graphicsData[i].type.toLowerCase() === 'mouse') {
                usbs.push(graphicsData[i].name);
                break
            }
        }
        if (usbs.length === 0) {
            return 'N/A';
        } else {
            return usbs[0];
        }
    }

    async printer() {
        const graphicsData = await si.printer();
        console.log('printer')
        console.log(graphicsData)
        let usbs = [];
        for (let i = 0; i < graphicsData.length; i++) {
            usbs.push(graphicsData[i].name + ' ' + graphicsData[i].model);
        }
        if (usbs.length === 0) {
            return 'N/A';
        } else {
            return usbs.join(', ');
        }
    }

    async disk() {
        const graphicsData = await si.diskLayout();
        console.log('disk')
        console.log(graphicsData)
        let usbs = [];
        for (let i = 0; i < graphicsData.length; i++) {
            usbs.push(graphicsData[i].name + ' ' + graphicsData[i].vendor + ' ' + (graphicsData[i].size / Math.pow(1024, 3)) + 'GB');
        }
        if (usbs.length === 0) {
            return 'N/A';
        } else {
            return usbs.join(', ');
        }
    }

    async motherboard() {
        const graphicsData = await si.system();
        console.log('motherboard')
        console.log(graphicsData)
        return graphicsData.manufacturer + ' ' + graphicsData.model;
    }

    async cpu() {
        const cpu = await si.cpu();
        return cpu.speed + 'GHz' + ' ' + cpu.physicalCores + ' cores ' + cpu.manufacturer + ' ' + cpu.brand
    }

    async ram() {
        let mems = {};
        for (const mem of await si.memLayout()) {
            const m = ((mem.size / Math.pow(1024, 3)).toFixed(0) + ' GB ' + mem.clockSpeed + ' Mhz ' + mem.type).trim();

            if (m in mems) {
                mems[m] += 1
            } else {
                mems[m] = 1
            }
        }
        let result = [];
        for (const key in mems) {
            result.push(mems[key] + 'x ' + key);
        }
        return result.join(', ');
    }

    async getHardwareInfo() {
        try {
            const hardwares = await this.hardwareInfo();
            let data = {
                hardwares: []
            };
            data.hardwares.push({
                name: 'cpu',
                description: await this.cpu()
            });
            data.hardwares.push({
                name: 'os',
                description: await this.osInfo()
            });
            data.hardwares.push({
                name: 'ram',
                description: await this.ram()
            });
            data.hardwares.push({
                name: 'graphics',
                description: await this.graphics()
            });
            data.hardwares.push({
                name: 'keyboard',
                description: await this.keyboard()
            });
            data.hardwares.push({
                name: 'mouse',
                description: await this.mouse()
            });
            data.hardwares.push({
                name: 'monitor',
                description: await this.monitors()
            });
            data.hardwares.push({
                name: 'printer',
                description: await this.printer()
            });
            data.hardwares.push({
                name: 'usb',
                description: await this.usb()
            });
            data.hardwares.push({
                name: 'hard disk / SSD',
                description: await this.disk()
            });
            data.hardwares.push({
                name: 'motherboard',
                description: await this.motherboard()
            });
            return data.hardwares;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    getSoft() {
        if (process.platform === 'win32') {
            return this.softwareInfoWindows()
        }
        return this.softwareInfo()
    }

    softwareInfo() {
        let dpkgLogs = execSync('zgrep \" installed \" /var/log/dpkg.log* || true').toString().split("\n").map(line => line.substring(line.indexOf(":") + 1));
        const softwares = execSync("for app in /usr/share/applications/*.desktop; do if [ \"`cat ${app} | grep NoDisplay= | cut -c11-`\" != \"true\" ]; then echo `cat ${app} | grep -m 1 Name= | cut -c6-`; fi; done;").toString().split("\n")
            .map(line => {
                let first = dpkgLogs.find(dpkgLog => dpkgLog.includes(line.toLowerCase()));
                if (first !== undefined) {
                    let split = first.split(" status installed ");
                    if (split.length === 2) {
                        let split2 = split[1].split(" ");
                        if (split2.length === 2) {
                            return {
                                name: line,
                                version: split2[1],
                                dateInstalled: split[0]
                            }
                        }
                        return {
                            name: line,
                            version: "N/A",
                            dateInstalled: split[0]
                        }
                    } else {
                        return {
                            name: line,
                            version: "N/A",
                            dateInstalled: "N/A"
                        }
                    }
                    return first;
                } else {
                    return {
                        name: line,
                        version: "N/A",
                        dateInstalled: "N/A"
                    }
                }
            });

        return softwares;
    }

    softwareInfoWindows() {
        const commands = [
            'powershell "Get-ItemProperty HKLM:Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object -Property DisplayName, DisplayVersion, InstallDate | ConvertTo-Json"',
            'powershell "Get-ItemProperty HKCU:Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object -Property DisplayName, DisplayVersion, InstallDate | ConvertTo-Json"',
            'powershell "Get-ItemProperty HKLM:Software\\WoW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object -Property DisplayName, DisplayVersion, InstallDate | ConvertTo-Json"'
        ];
        let softwares = []
        let a = commands.flatMap(c => JSON.parse(execSync(c).toString())).filter(c => c['DisplayName']);
        let unique = [];
        for (let i in a) {
            if (unique.includes(a[i]['DisplayName']) !== undefined) {
                softwares.push({
                    name: a[i]['DisplayName'],
                    version: a[i]['DisplayVersion'],
                    dateInstalled: a[i]['InstallDate'] === undefined ? 'N/A' : moment(a[i]['InstallDate']).format('YYYY-MM-DD'),
                });
                unique.push(a[i]['DisplayName']);
            }
        }
        console.log(softwares)
        return softwares
    }
}
const loginWithGoogle = async () => {
    console.log('test')
    ipcRenderer.send('show-dashboard-view', {'test': 'test'});
}

const hardwareInfoService = new HardwareInformation()
const backgroundService = document.getElementById("background-service")
const hardwareInfo = document.getElementById("hardware")
const softwareInfo = document.getElementById("software")

// backgroundService.style.visibility = "visible"
hardwareInfo.style.display = "none"
softwareInfo.style.display = "none"

const openBackgroundService = () => {
    backgroundService.style.display = "block"
    hardwareInfo.style.display = "none"
    softwareInfo.style.display = "none"
}

const openHardwareService = async () => {
    backgroundService.style.display = "none"
    hardwareInfo.style.display = "block"
    softwareInfo.style.display = "none"

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
    let table = document.getElementById("software-table")
    let softwares = hardwareInfoService.getSoft()
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

const screenCapture = () => {
    ipcRenderer.invoke('screenshot-capture')
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
}


