var fs = require("fs");
const path = require("path");
const Files = require("./files");

// Stores a message sent by a sender
const storeMessage = (recipient_username, sender_username, msg, signature) => {
  
  const filepath = path.join(__dirname, "..", "data", recipient_username, `${sender_username}.json`);
  let msgs = [];

  // Check if file exists and load msgs;
  if (fs.existsSync(filepath)) msgs = require(filepath);

  msgs.push({ msg, signature });

  Files.createFile(recipient_username, `${sender_username}.json`, JSON.stringify(msgs));
};

// Returns all messages sent by a sender
const getMessages = (recipient_username, sender_username) => {
  const filepath = path.join(__dirname, "..", "data", recipient_username, `${sender_username}.json`);

  if (!fs.existsSync(filepath)) return null;

  const msgs = require(filepath);
  return msgs;
};

module.exports = {
  storeMessage,
  getMessages,
};
