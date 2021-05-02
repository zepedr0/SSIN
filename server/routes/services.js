const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/servicesController");

const validateToken = require("../middlewares/validateToken");
const minClearanceLevel = require("../middlewares/minClearanceLevel");

router.get("/1/:value", servicesController.squareRoot);
router.get("/2/:value", servicesController.cubicRoot);
router.get("/3/:value", servicesController.paramRoot);

module.exports = router;
