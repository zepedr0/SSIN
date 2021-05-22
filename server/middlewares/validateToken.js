const userController = require("../controllers/userController");
const jwt = require("jsonwebtoken");

const validateToken = async (req, res, next) => {
  const token = req.header("token");

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      return res.status(401).json({ error: "Access denied" });
    }

    // Search for user by username
    const user_match = userController.getUser(payload.username);

    // Username was not found
    if (!user_match) {
      return res.status(401).json({ error: "Access denied" });
    }

    // Makes the user available to following middlewares / methods
    req.body.auth_user = user_match;

    res.locals.username = payload.username
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = validateToken;
