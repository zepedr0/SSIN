const path = require("path");
const fs = require("fs");

// All functions relative to user username folder

const createFile = (username, filename, content) => {
  const dir = path.join(__dirname, "..", "data", username);
  fs.writeFileSync(`${dir}/${filename}`, content);
};

const createFolder = (username) => {
  const dir = path.join(__dirname, "..", "data", username);
  fs.mkdirSync(dir);
};

const existsDir = (username) => {
  const dir = path.join(__dirname, "..", "data", username);
  return fs.existsSync(dir);
};

const existsFile = (username, filename) => {
  const dir = path.join(__dirname, "..", "data", username);
  return fs.existsSync(`${dir}/${filename}`);
};

const deleteFile = (username, filename) => {
  const dir = path.join(__dirname, "..", "data", username);
  fs.unlinkSync(`${dir}/${filename}`);
};

module.exports = {
  createFile,
  createFolder,
  existsFile,
  deleteFile,
  existsDir,
};
