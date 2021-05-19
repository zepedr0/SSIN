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
router.get('/communication-info', validateToken, minClearanceLevel.securityLevel1, userController.getUsersCommunicationInfo)
router.post('/communication-info', validateToken, minClearanceLevel.securityLevel1, userController.postPort)
router.post('/certificate-requests', validateToken, minClearanceLevel.securityLevel1, userController.signCertificateRequest)
router.post("/logout", validateToken, userController.logoutClient);

module.exports = router;
