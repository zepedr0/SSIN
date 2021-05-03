const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/servicesController");

const validateToken = require("../middlewares/validateToken");
const minClearanceLevel = require("../middlewares/minClearanceLevel");

router.get(
  "/1/:value",
  validateToken,
  minClearanceLevel.securityLevel1,
  servicesController.squareRoot
);
router.get(
  "/2/:value",
  validateToken,
  minClearanceLevel.securityLevel2,
  servicesController.cubicRoot
);
router.get(
  "/3/:value/:root",
  validateToken,
  minClearanceLevel.securityLevel3,
  servicesController.paramRoot
);

module.exports = router;
