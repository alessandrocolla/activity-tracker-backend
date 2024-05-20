const express = require("express");
const taskController = require("../controllers/taskController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protectRoute, taskController.getTasks)
  .post(authController.protectRoute, authController.restrictTo("admin"), taskController.createTask);
router
  .route("/:id")
  .get(authController.protectRoute, taskController.getTask)
  .delete(authController.protectRoute, taskController.deleteTask)
  .patch(authController.protectRoute, taskController.updateTask);

module.exports = router;
