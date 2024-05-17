const express = require("express");
const activityController = require("../controllers/activityController");

const router = express.Router();

router.route("/").post(activityController.createActivity);

module.exports = router;
