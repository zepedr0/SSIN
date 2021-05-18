const path = require("path");
const fs = require("fs");

// All functions relative to data folder
const dataDir = path.join(__dirname, "..", "data")

const createFile = (folder, filename, content) => {
  const dir = path.join(dataDir, ...folder);
  fs.writeFileSync(`${dir}/${filename}`, content);
};

const createFolder = (folder) => {
  const dir = path.join(dataDir, ...folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const existsFile = (folder, filename) => {
  const dir = path.join(dataDir, ...folder);
  return fs.existsSync(`${dir}/${filename}`);
};

const existsDir = (folder) => {
  const dir = path.join(dataDir, ...folder);
  return fs.existsSync(dir);
};

const deleteFile = (folder, filename) => {
  const dir = path.join(dataDir, ...folder);
  fs.unlinkSync(`${dir}/${filename}`);
};

module.exports = {
  createFile,
  createFolder,
  existsFile,
  deleteFile,
  existsDir,
};
