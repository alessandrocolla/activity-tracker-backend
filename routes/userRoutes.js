const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.loginAuth, authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/changeStatus/:id",
  authController.protectRoute,
  authController.restrictTo("admin"),
  userController.changeStatus,
);

router
  .route("/")
  .get(authController.protectRoute, userController.getUsers)
  .post(authController.protectRoute, userController.createUser);
router
  .route("/:id")
  .get(authController.protectRoute, userController.getUser)
  .patch(authController.protectRoute, userController.updateUser)
  .delete(authController.protectRoute, userController.deleteUser);
router.route("/:id/activities").get(authController.protectRoute, userController.getUserActivities);
router
  .route("/:userID/activities/:activityID")
  .patch(authController.protectRoute, authController.restrictTo("admin"), userController.updateUserActivities);

router.patch("/updateMyPassword", authController.protectRoute, authController.updatePassword);

module.exports = router;
