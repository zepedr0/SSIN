var fs = require("fs");
const path = require("path");

// Stores a message in user's directory
const storeMessage = (one_time_id, msg, signature) => {
  const dir = path.join(__dirname, "..", "data", one_time_id);
  const filepath = path.join(__dirname, "..", "data", one_time_id, "msgs.json");

  // If user does not have a directory yet
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  console.log(filepath);
  console.log();

  // If msgs file does not exist
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify([]), function (err) {
      if (err) throw err;
      console.log("Saved!");
    });
  }

  // Get msgs and add new one
  const msgs = require(filepath);
  msgs.push({ msg, signature });

  fs.writeFileSync(filepath, JSON.stringify(msgs), function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
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
