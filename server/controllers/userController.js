const fs = require("fs");
const jwt = require("jsonwebtoken");

const readJSONFile = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  return data;
};

const writeJSONFile = (filePath, content) => {
  fs.writeFileSync(filePath, content);
};

const getUser = (username) => {
  const users = readJSONFile("./data/users.json");

  // Search for user
  return users.find((user) => user.credentials.username === username);
};

const getAllUsers = (req, res) => {
  const users = readJSONFile("./data/users.json");
  return res.status(200).json(users);
};

const registerUser = (req, res) => {
  const { one_time_id, username } = req.body;
  const user_match = getUser(username);

  if (!user_match) {
    // Registration failed
    return res.status(400).json({ error: "Invalid credentials!" });
  }

  if (user_match.credentials.one_time_id !== one_time_id) {
    // Registration failed
    return res.status(400).json({ error: "Invalid credentials!" });
  }

  if (user_match.has_client_session) {
    // Registration failed
    return res.status(400).json({
      error: "There is already a client with session in this account",
    });
  }

  // one_time_id and username match an user

  // Creates JWT
  const auth_token = jwt.sign(
    { username: user_match.credentials.username },
    process.env.JWT_SECRET
  );

  // Sets client's session state
  setSessionState(username, true);

  // Returns JWT
  return res.status(200).json({ token: auth_token });
};

const logoutClient = (req, res) => {
  const { username } = req.auth_user.credentials;
  setSessionState(username, false);

  return res.status(200).json({ success: true });
};

const setSessionState = (username, value) => {
  let all_user_data = readJSONFile("./data/users.json");

  all_user_data.forEach((v) => {
    if (v.credentials.username === username) {
      v.has_client_session = value;
    }
  });

  writeJSONFile("./data/users.json", JSON.stringify(all_user_data));
};

module.exports = {
  getAllUsers,
  registerUser,
  getUser,
  logoutClient,
};
