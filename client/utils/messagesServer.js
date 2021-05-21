const express = require('express')
const https = require('https')
const fs = require('fs')
const path = require('path')
const app = express()
const { pki } = require('node-forge')

const { checkSign } = require('./cryptography')
const Messages = require('./messages')
const Cryptography = require('./cryptography')

let sessionInfo;

const processMessage = async (req, res) => {
    const { msg, sig } = req.body
    const peerCertificate = pki.certificateFromPem(req.socket.getPeerX509Certificate().toString())
    if (!checkSign(pki.publicKeyToPem(peerCertificate.publicKey), msg, sig)) {
        res.status(403).send({ message: 'Digital signature is not valid' })
    }

    const encMsg = Cryptography.localEncrypt(msg, this.sessionInfo.user_private_info.key);
    const encSig = Cryptography.localEncrypt(sig, this.sessionInfo.user_private_info.key);
    const encCert = Cryptography.localEncrypt(pki.certificateToPem(peerCertificate), this.sessionInfo.user_private_info.key);
    Messages.storeMessage(
      this.sessionInfo.username,
      peerCertificate.subject.getField('CN') !== null ? peerCertificate.subject.getField('CN').value : undefined,
      encMsg,
      encSig,
      encCert
    );

    res.status(201).send()
}

const createMessageServer = async (sessionInfo) => {
    
    this.sessionInfo = sessionInfo

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // if PORT is not specified in the env variables, it will be set to 0 (operating system will assign an arbitrary unused port)
    const port = process.env.PORT === undefined ? 0 : process.env.PORT

    const privKey = Cryptography.privKeyEncPemtoPem(fs.readFileSync(path.join(__dirname, '..', 'data', sessionInfo.username, 'keys', 'key.pem')), sessionInfo.user_private_info.key)
    const options = {
        key: privKey,
        cert: fs.readFileSync(path.join(__dirname, '..', 'data', sessionInfo.username, 'keys', 'cert.pem')),
        ca: fs.readFileSync(path.join(__dirname, '..', 'data', 'CA', 'ca-crt.pem')),
        requestCert: true,
        rejectUnauthorized: true
    }

    app.post('/', processMessage)

    const server = https.createServer(options, app).listen(port)

    return server
}

module.exports = {
    createMessageServer
}