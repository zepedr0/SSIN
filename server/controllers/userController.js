const fs = require("fs");
const jwt = require("jsonwebtoken");

const readJSONFile = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  return data;
};

const getAllUsers = (req, res) => {
  const users = readJSONFile("./data/users.json");
  return res.status(200).json(users);
};

const registerUser = (req, res) => {
  const { one_time_id, username } = req.body;

  const users = readJSONFile("./data/users.json");

  // Search for user
  const user_match = users.find(
    (user) =>
      user.credentials.one_time_id === one_time_id &&
      user.credentials.username === username
  );

  // (one_time_id, username) pair found
  if (user_match) {
    // Creates JWT
    const auth_token = jwt.sign(
      { username: user_match.credentials.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Returns JWT
    return res.status(200).json({ token: auth_token });
  }

  // Registration failed
  return res.status(400).json({ error: "Invalid credentials!" });
};

module.exports = {
  getAllUsers,
  registerUser,
};
