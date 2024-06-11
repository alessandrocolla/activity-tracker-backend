const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: [true, "Please enter the task name"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  state: {
    type: String,
    enum: {
      values: ["To do", "In progress", "Done"],
      message: "State is either: 'To do', 'In progress', 'Done'",
    },
    default: "To do",
  },
  progressState: {
    type: Number,
    default: 0,
    min: [0, "Progress state must be above or equal to 0"],
    max: [100, "Progress state must be below or equal to 100"],
    required: [true, "Please enter a number for the progress status"],
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
