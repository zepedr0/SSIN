const fs = require("fs");

const getAllUsers = (req, res) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json"));
  console.log(JSON.stringify(users));
  return res.status(200).json(users);
};

module.exports = {
  getAllUsers,
};
