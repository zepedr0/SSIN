const util = require('util');
const readline = require('readline')
const Messages = require('./messages')

const chat = async (sessionInfo, receiverPort) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    
    const question = util.promisify(rl.question).bind(rl);
    const exitCode = ':q'

    const recursiveReadLine = async () => {
        const message = await question('Write (type \':q\' and press ENTER to go back): ')
        if (message === exitCode) {
            return
        }
        Messages.sendMessage(sessionInfo, message, receiverPort)
        await recursiveReadLine()
    }

    await recursiveReadLine()
    rl.close()
}

module.exports = {
    chat
}