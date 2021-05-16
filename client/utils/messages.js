var fs = require("fs");
const path = require("path");
const Files = require("./files");

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

module.exports = {
  storeMessage,
  getMessages,
};
