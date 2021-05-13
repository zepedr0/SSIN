const path = require("path");
const fs = require("fs");

// All functions relative to user one-time-id folder

const createFile = (one_time_id, filename, content) => {
  const dir = path.join(__dirname, "..", "data", one_time_id);
  fs.writeFileSync(`${dir}/${filename}`, content);
};

const createFolder = (one_time_id) => {
  const dir = path.join(__dirname, "..", "data", one_time_id);
  fs.mkdirSync(dir);
};

const existsFile = (one_time_id, filename) => {
  const dir = path.join(__dirname, "..", "data", one_time_id);
  return fs.existsSync(`${dir}/${filename}`);
};

module.exports = {
  createFile,
  createFolder,
  existsFile,
};
