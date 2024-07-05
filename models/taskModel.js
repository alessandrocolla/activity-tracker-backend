const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: [true, "Please enter the task name"],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expectedHours: {
    type: Number,
    min: [1, "Expected hours must be above or equal to 1"],
    required: [true, "Please enter a number for the expected hours"],
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

taskSchema.pre("save", async function (next) {
  const task = this;

  if (!task.isModified("taskName")) {
    return next();
  }

  try {
    const existingTask = await mongoose.models.Task.findOne({
      taskName: { $regex: new RegExp("^" + task.taskName + "$", "i") },
    });

    if (existingTask) {
      const error = new AppError("Task name already exists", 400);
      return next(error);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
