let moment = require('moment')
let electron = window.require('electron');
let {ipcRenderer} = electron;

let breakInterval = null
let hour = document.getElementById('hour')
let minute = document.getElementById('minute')
let second = document.getElementById('second')
let startButton = document.getElementById('start')
let cancelButton = document.getElementById('cancel')
let stopButton = document.getElementById('stop')

const startBreak = () => {
    startButton.style.display = 'none'
    cancelButton.style.display = 'none'
    stopButton.style.display = 'block'

    let startDate = moment()

    breakInterval = setInterval(() => {
        let currentDate = moment()
        let duration = moment.utc(moment.duration(currentDate.diff(startDate)).asMilliseconds()).format("HH:mm:ss").split(':')
        hour.innerHTML = duration[0]
        minute.innerHTML = duration[1]
        second.innerHTML = duration[2]
    }, 1000);
}

const cancel = () => {
    ipcRenderer.send('close-coffee-break')
}
const stop = () => {
    startButton.style.display = 'block'
    cancelButton.style.display = 'block'
    stopButton.style.display = 'none'
    if (breakInterval != null) {
        clearInterval(breakInterval)
        hour.innerHTML = '00'
        minute.innerHTML = '00'
        second.innerHTML = '00'
    }
}