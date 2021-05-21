var fs = require("fs");
const path = require("path");
const Files = require("./files");
const axios = require('axios')
const https = require('https')
const crypto = require('crypto')

const Cryptography = require('./cryptography')

// Stores a message sent by a sender
const storeMessage = (recipient_username, sender_username, msg, signature, senderCert) => {
  
  const filepath = path.join(__dirname, "..", "data", recipient_username, 'messages', `${sender_username}.json`);
  let msgs = [];

  // Check if file exists and load msgs;
  if (fs.existsSync(filepath)) msgs = require(filepath);

  msgs.push({ msg, signature, senderCert });

  Files.createFile([recipient_username, 'messages'], `${sender_username}.json`, JSON.stringify(msgs));
};

// Returns all messages sent by a sender
const getMessages = (recipient_username, sender_username) => {
  const filepath = path.join(__dirname, "..", "data", recipient_username, 'messages', `${sender_username}.json`);

  if (!fs.existsSync(filepath)) return null;

  const msgs = require(filepath);
  return msgs;
};

// send message
const sendMessage = async (sessionInfo, msg, receiverPort) => {
  try {
    const keysDir = path.join(__dirname, '..', 'data', sessionInfo.username, 'keys')
    const privKey = Cryptography.privKeyEncPemtoPem(fs.readFileSync(path.join(keysDir, 'key.pem')), sessionInfo.user_private_info.key)
    const sig = Cryptography.sign(privKey, msg)
    const httpsAgent = new https.Agent({
      key: privKey,
      cert: fs.readFileSync(path.join(keysDir, 'cert.pem')),
      ca: fs.readFileSync(path.join(__dirname, '..', 'data', 'CA', 'ca-crt.pem')),
      rejectUnauthorized: false
    })
    axios
      .post(`https://0.0.0.0:${receiverPort}/`, {
        msg: msg,
        sig: sig
      },
      {
        httpsAgent
      })
      .then((response) => {
        return response
      })
      .catch((error) => {
        console.log(error)
      })
  } catch (error) {
    console.log(error)
  }
}

const seeMessages = (sessionInfo, sender_id) => {
  const msgs = getMessages(sessionInfo.username, sender_id);
  if (msgs === null || msgs.length === 0) {
    console.log(`No messages from ${sender_id}`);
    return
  }

  msgs.forEach((msg, i) => {
    const decMsg = Cryptography.localDecrypt(msg.msg, sessionInfo.user_private_info.key);
    const decSig = Cryptography.localDecrypt(msg.signature, sessionInfo.user_private_info.key);
    const decSenderCert = Cryptography.localDecrypt(msg.senderCert, sessionInfo.user_private_info.key);
    const senderCert = new crypto.X509Certificate(decSenderCert)
    const isSigValid = Cryptography.checkSign(senderCert.publicKey, decMsg, decSig)
    console.log(`Msg #${i}:\n\tIs digital signature valid? ${isSigValid}\n\tmsg: ${decMsg}\n\tsig: ${decSig}\n\tsenderCert: ${decSenderCert}`);
  });
}

module.exports = {
  storeMessage,
  getMessages,
  sendMessage,
  seeMessages
};
