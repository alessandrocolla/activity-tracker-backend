const express = require("express");
const activityController = require("../controllers/activityController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protectRoute, activityController.getActivities)
  .post(authController.protectRoute, activityController.createActivity);
router
  .route("/:id")
  .get(authController.protectRoute, activityController.getActivity)
  .patch(authController.protectRoute, activityController.updateActivity)
  .delete(authController.protectRoute, activityController.deleteActivity);

module.exports = router;
