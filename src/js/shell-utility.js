const {execSync} = require('child_process');

const shellCommand = (command) => {
    return execSync(command).toString().split('\n')
        .map(c => c.trim())
        .filter(c => c.length !== 0)
};

module.exports = {shellCommand};