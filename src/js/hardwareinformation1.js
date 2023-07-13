const si = require('systeminformation');
const moment = require('moment');

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
            const hardwares = await hardwareInfo();
            let data = {
                hardwares: []
            };
            data.hardwares.push({
                name: 'cpu',
                description: await cpu()
            });
            data.hardwares.push({
                name: 'os',
                description: await osInfo()
            });
            data.hardwares.push({
                name: 'ram',
                description: await ram()
            });
            data.hardwares.push({
                name: 'graphics',
                description: await graphics()
            });
            data.hardwares.push({
                name: 'keyboard',
                description: await keyboard()
            });
            data.hardwares.push({
                name: 'mouse',
                description: await mouse()
            });
            data.hardwares.push({
                name: 'monitor',
                description: await monitors()
            });
            data.hardwares.push({
                name: 'printer',
                description: await printer()
            });
            data.hardwares.push({
                name: 'usb',
                description: await usb()
            });
            data.hardwares.push({
                name: 'hard disk / SSD',
                description: await disk()
            });
            data.hardwares.push({
                name: 'motherboard',
                description: await motherboard()
            });
            console.log(data)
            return data.hardwares
        } catch (e) {
            console.log(e);
        }
        return []
    }

    getSoft() {
        if (process.platform === 'win32') {
            return softwareInfoWindows()
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
        softwares = []
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
    }
}

module.exports = {HardwareInformation};