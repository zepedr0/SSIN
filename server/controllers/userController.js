const fs = require("fs");
const jwt = require("jsonwebtoken");

const readJSONFile = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  return data;
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

  // one_time_id and username match an user

  // Creates JWT
  const auth_token = jwt.sign(
    { username: user_match.credentials.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Returns JWT
  return res.status(200).json({ token: auth_token });
};

const getUsersCommunicationInfo = (req, res) => {
  const users = readJSONFile('./data/users.json')

  const onlineUsers = users.map(user => {
    return { 
      full_name: user.identity.full_name, 
      last_seen: user.last_seen,
      port: user.port
    }
  })

  res.status(200).send(onlineUsers)
} 

const postPort = (req, res) => {
  const { port } = req.body

  const usersDataPath = './data/users.json'
  const users = readJSONFile(usersDataPath)
  users.forEach(user => {
    if (user.credentials.username === res.locals.username) {
      user.last_seen = Date.now()
      user.port = port
    }
  })

  fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2))

  res.status(201).send()
}

module.exports = {
  getAllUsers,
  registerUser,
  getUser,
  getUsersCommunicationInfo,
  postPort
};
