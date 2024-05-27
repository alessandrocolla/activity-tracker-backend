const express = require("express");
const activityController = require("../controllers/activityController");
const authController = require("../controllers/authController");
const { restrictToOwnerOrAdmin } = require("../controllers/authController");
const Activity = require("../models/activityModel");

const router = express.Router();

router
  .route("/")
  .get(authController.protectRoute, authController.restrictTo("admin"), activityController.getActivities)
  .post(authController.protectRoute, activityController.createActivity);
router
  .route("/:id")
  .get(authController.protectRoute, restrictToOwnerOrAdmin(Activity), activityController.getActivity)
  .patch(authController.protectRoute, restrictToOwnerOrAdmin(Activity), activityController.updateActivity)
  .delete(authController.protectRoute, restrictToOwnerOrAdmin(Activity), activityController.deleteActivity);

module.exports = router;
