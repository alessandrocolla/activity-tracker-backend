const express = require("express");
const taskController = require("../controllers/taskController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(taskController.getTasks).post(authController.restrictTo("admin"), taskController.createTask);
router
  .route("/:id")
  .get(taskController.getTask)
  .delete(authController.restrictTo("admin"), taskController.deleteTask)
  .patch(authController.restrictTo("admin"), taskController.updateTask);

module.exports = router;
