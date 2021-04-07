const fs = require("fs");

const readJSONFile = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  return data;
};

const getAllUsers = (req, res) => {
  const users = readJSONFile("./data/users.json");
  return res.status(200).json(users);
};

const registerUser = (req, res) => {
  console.log(req.body);
  //   const { one_time_id, username } = req.body;
  const users = readJSONFile("./data/users.json");
  const result = users.filter((user) => {
    return user.credentials === req.body;
  });

  //   console.log(users);
  console.log(result);
  return res.status(200).json({ success: result.length !== 0 });
};

module.exports = {
  getAllUsers,
  registerUser,
};
