var fs = require("fs");
const path = require("path");
const Files = require("./files");
const axios = require('axios')
const { sign } = require('./cryptography')
const https = require('https')

// Stores a message sent by a sender
const storeMessage = (recipient_one_time_id, sender_one_time_id, msg, signature) => {
  
  const filepath = path.join(__dirname, "..", "data", recipient_one_time_id, `${sender_one_time_id}.json`);
  let msgs = [];

  // Check if file exists and load msgs;
  if (fs.existsSync(filepath)) msgs = require(filepath);

  msgs.push({ msg, signature });

  Files.createFile(recipient_one_time_id, `${sender_one_time_id}.json`, JSON.stringify(msgs));
};

// Returns all messages sent by a sender
const getMessages = (recipient_one_time_id, sender_one_time_id) => {
  const filepath = path.join(__dirname, "..", "data", recipient_one_time_id, `${sender_one_time_id}.json`);

  if (!fs.existsSync(filepath)) return null;

  const msgs = require(filepath);
  return msgs;
};

// send message
const sendMessage = async (username, msg, receiverPort) => {
  // TODO: alterar path, está hardcoded
  // const encPrivKey = fs.readFileSync(path.join(__dirname, '..', 'data', '45a78b4f3456', 'private.pem'))
  // const privKey = crypto.createPrivateKey({
  //   key: encPrivKey,
  //   format: 'pem',
  //   type: 'pkcs8',
  //   cipher: 'aes-256-cbc',
  //   passphrase: 'amogus'
  // })
  try {
    const keysDir = path.join(__dirname, '..', 'data', username, 'keys')
    // TODO: guardar a priv key encriptada, criar o csr no node e pedir ao server o certificate
    const privKey = fs.readFileSync(path.join(keysDir, 'client-key.pem'))
    const sig = sign(privKey, msg)
    const httpsAgent = new https.Agent({
      key: privKey,
      cert: fs.readFileSync(path.join(keysDir, 'client-crt.pem')),
      ca: fs.readFileSync(path.join(__dirname, '..', 'data', 'CA', 'ca-crt.pem')),
      rejectUnauthorized: false
    })
    axios
      .post(`https://0.0.0.0:${receiverPort}/`, {
        // // TODO: alterar, está hardcoded
        // username: 'usefname',
        msg: msg,
        sig: sig
      },
      {
        httpsAgent
      })
      .then((response) => {
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
