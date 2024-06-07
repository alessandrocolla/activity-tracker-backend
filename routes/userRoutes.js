const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { restrictToOwnerOrAdmin } = require("../controllers/authController");
const User = require("../models/userModel");
const activityRouter = require("./activityRoutes");

const router = express.Router();

// Nested Routes

// Non-Nested Routes

router.post("/signup", authController.signup);
router.post("/login", authController.loginAuth, authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.loginAuth, authController.forgotPassword);
router.patch("/resetPassword/:token", authController.loginAuth, authController.resetPassword);

router.patch("/updateMyPassword", authController.protectRoute, authController.updatePassword);

router.patch(
  "/changeStatus/:id",
  authController.protectRoute,
  authController.restrictTo("admin"),
  userController.changeStatus,
);

router.get("/getMe", authController.protectRoute, userController.getMe, userController.getUser);

router.patch(
  "/updateMe",
  authController.protectRoute,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);

router.route("/").get(authController.protectRoute, authController.restrictTo("admin"), userController.getUsers);

router
  .route("/:id")
  .get(authController.protectRoute, restrictToOwnerOrAdmin(User), userController.getUser)
  .patch(authController.protectRoute, authController.restrictTo("admin"), userController.updateUser)
  .delete(authController.protectRoute, restrictToOwnerOrAdmin(User), userController.deleteUser);

module.exports = router;
