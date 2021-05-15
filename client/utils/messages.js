var fs = require("fs");
const path = require("path");
const Files = require("./files");

// Stores a message in user's directory
const storeMessage = (one_time_id, msg, signature) => {
  const filepath = path.join(__dirname, "..", "data", one_time_id, "msgs.json");

  // Get msgs and add new one
  const msgs = require(filepath);
  msgs.push({ msg, signature });

  Files.createFile(one_time_id, 'msgs.json', JSON.stringify(msgs));
};

// Returns all user messages
const getMessages = (one_time_id) => {
  const filepath = path.join(__dirname, "..", "data", one_time_id, "msgs.json");

  if (!fs.existsSync(filepath)) return [];

  const msgs = require(filepath);
  return msgs;
};

module.exports = {
  storeMessage,
  getMessages,
};
