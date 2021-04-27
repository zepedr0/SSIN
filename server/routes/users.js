const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const validateToken = require("../middlewares/validateToken");

router.get("/getAll", validateToken, userController.getAllUsers);
router.post("/register", userController.registerUser);

module.exports = router;
