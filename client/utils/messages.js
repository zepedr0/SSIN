var fs = require("fs");
const path = require("path");
const Files = require("./files");
const axios = require('axios')
const { sign } = require('./cryptography')
const https = require('https')

// Stores a message sent by a sender
const storeMessage = (recipient_username, sender_username, msg, signature) => {
  
  const filepath = path.join(__dirname, "..", "data", recipient_username, `${sender_username}.json`);
  let msgs = [];

  // Check if file exists and load msgs;
  if (fs.existsSync(filepath)) msgs = require(filepath);

  msgs.push({ msg, signature });

  Files.createFile([recipient_username, 'messages'], `${sender_username}.json`, JSON.stringify(msgs));
};

// Returns all messages sent by a sender
const getMessages = (recipient_username, sender_username) => {
  const filepath = path.join(__dirname, "..", "data", recipient_username, `${sender_username}.json`);

  if (!fs.existsSync(filepath)) return null;

  const msgs = require(filepath);
  return msgs;
};

// send message
const sendMessage = async (username, msg, receiverPort) => {
  try {
    const keysDir = path.join(__dirname, '..', 'data', username, 'keys')
    // TODO: guardar a priv key encriptada, criar o csr no node e pedir ao server o certificate
    const privKey = fs.readFileSync(path.join(keysDir, 'key.pem'))
    const sig = sign(privKey, msg)
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
        // TODO: alterar isto
        console.log("enviou")
        // TODO: caso seja para guardar as mensagens enviadas temos que ver se este post retorna 201
      })
      .catch((error) => {
        console.log(error)
      })
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  storeMessage,
  getMessages,
  sendMessage
};
