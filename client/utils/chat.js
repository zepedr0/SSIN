const readline = require('readline')
const { sendMessage } = require('./messages')

const recursiveReadLine = (username, rl, exitCode) => {
    rl.question('Write: ', (message) => {
        if (message === exitCode) {
            return rl.close()
        }
        // TODO: ip e porta estão hardcoded
        sendMessage(username, message, 'localhost', 5000)
        recursiveReadLine(username, rl, exitCode)
    })
}

const chat = async (username) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    
    recursiveReadLine(username, rl, ':q')
}

module.exports = {
    chat
}