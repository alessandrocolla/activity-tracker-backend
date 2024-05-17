const express = require("express");
const activityController = require("../controllers/activityController");

const router = express.Router();

router.route("/").get(activityController.getActivities);

module.exports = router;
