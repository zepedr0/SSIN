const express = require('express')
const https = require('https')
const fs = require('fs')
const path = require('path')
const app = express()
const { checkSign } = require('./cryptography')
const crypto = require('crypto')

const processMessage = async (req, res) => {
    const { msg, sig } = req.body
    const peerCertificate = req.socket.getPeerCertificate()
    console.log('Sender: ', peerCertificate.subject.CN)
    console.log('Verify message signature: ', checkSign(crypto.createPublicKey({key: peerCertificate.pubkey, format: 'der', type: 'spki'}), msg, sig))

    // TODO: caso a message signature esteja correta, guardar mensagem localstorage, conforme o username

    res.status(200).send()
}

const createMessageServer = async (username) => {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // if PORT is not specified in the env variables, it will be set to 0 (operating system will assign an arbitrary unused port)
    const port = process.env.PORT === undefined ? 0 : process.env.PORT

    // TODO: fazer um request ao server a pedir o CA
    const options = {
        key: fs.readFileSync(path.join(__dirname, '..', 'data', username, 'keys', 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, '..', 'data', username, 'keys', 'cert.pem')),
        ca: fs.readFileSync(path.join(__dirname, '..', 'data', 'CA', 'ca-crt.pem')),
        requestCert: true,
        rejectUnauthorized: true
    }

    app.post('/', processMessage)

    const server = https.createServer(options, app).listen(port, () => {
        // TODO: tirar esta mensagem
        console.log(`Listening for messages at https://localhost:${server.address().port}`)
    })

    return server
}

module.exports = {
    createMessageServer
}