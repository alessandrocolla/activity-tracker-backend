const express = require("express");
const activityController = require("../controllers/activityController");
const authController = require("../controllers/authController");
const { restrictToOwnerOrAdmin } = require("../controllers/authController");
const Activity = require("../models/activityModel");

const router = express.Router();

router.use(authController.protectRoute);

router
  .route("/")
  .get(authController.restrictTo("admin"), activityController.getActivities)
  .post(activityController.createActivity);

router.get("/me", activityController.personalActivities);

router.use(restrictToOwnerOrAdmin(Activity));

router
  .route("/:id")
  .get(activityController.getActivity)
  .patch(activityController.updateActivity)
  .delete(activityController.deleteActivity);

module.exports = router;
