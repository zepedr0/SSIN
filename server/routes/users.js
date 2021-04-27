const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const validateToken = require("../middlewares/validateToken");
const minClearanceLevel = require("../middlewares/minClearanceLevel");

router.get(
  "/getAll",
  validateToken,
  minClearanceLevel.securityLevel3,
  userController.getAllUsers
);
router.post("/register", userController.registerUser);

module.exports = router;
