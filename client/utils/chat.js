const util = require('util');
const readline = require('readline')
const { sendMessage } = require('./messages')

const chat = async (username, receiverPort) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    
    const question = util.promisify(rl.question).bind(rl);
    const exitCode = ':q'

    const recursiveReadLine = async () => {
        const message = await question('Write: ')
        if (message === exitCode) {
            return
        }
        sendMessage(username, message, receiverPort)
        await recursiveReadLine()
    }

    await recursiveReadLine()
    rl.close()
}

module.exports = {
    chat
}