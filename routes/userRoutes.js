const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { restrictToOwnerOrAdmin } = require("../controllers/authController");
const User = require("../models/userModel");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.loginAuth, authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.loginAuth, authController.forgotPassword);
router.patch("/resetPassword/:token", authController.loginAuth, authController.resetPassword);

router.use(authController.protectRoute);

router.patch("/updateMyPassword", authController.updatePassword);

router.patch("/changeStatus/:id", authController.restrictTo("admin"), userController.changeStatus);

router.patch("/updateMe", userController.updateMe);

router.route("/").get(authController.restrictTo("admin"), userController.getUsers).post(userController.createUser);

router.route("/:id/activities").get(authController.restrictTo("admin"), userController.getUserActivities);

router
  .route("/:userID/activities/:activityID")
  .patch(authController.restrictTo("admin"), userController.updateUserActivities);

router.use(restrictToOwnerOrAdmin(User));

router.route("/:id").get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
