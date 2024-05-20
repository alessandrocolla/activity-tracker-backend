const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.route("/").get(userController.getUsers).post(userController.createUser);
router.route("/:id").get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);
router.route("/:id/activities").get(userController.getUserActivities);

router.patch("/updateMyPassword", authController.updatePassword);

module.exports = router;
