const express = require("express");
const activityController = require("../controllers/activityController");

const router = express.Router();

router.route("/").get(activityController.getActivities);
router.route("/:id").get(activityController.getActivity);

module.exports = router;
