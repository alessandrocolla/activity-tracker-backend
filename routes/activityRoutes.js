const express = require("express");
const activityController = require("../controllers/activityController");
const authController = require("../controllers/authController");
const { restrictToOwnerOrAdmin } = require("../controllers/authController");
const Activity = require("../models/activityModel");
const { body } = require("express-validator");
const { error } = require("console");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    authController.protectRoute,
    authController.restrictTo("admin"),
    activityController.setUserID,
    activityController.getActivities,
  )
  .post(authController.protectRoute, activityController.createActivity);

router.get("/me", authController.protectRoute, activityController.personalActivities);

router
  .route("/:id")
  .get(authController.protectRoute, restrictToOwnerOrAdmin(Activity), activityController.getActivity)
  .patch(
    authController.protectRoute,
    restrictToOwnerOrAdmin(Activity),
    activityController.setUserID,
    activityController.updateActivity,
  )
  .delete(authController.protectRoute, restrictToOwnerOrAdmin(Activity), activityController.deleteActivity);

module.exports = router;
