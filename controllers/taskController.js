const Task = require("../models/taskModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find();

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) return next(new AppError("Task not found.", 404));

  res.status(200).json({
    status: "success",
    data: {
      Tasks: task,
    },
  });
});

exports.createTask = catchAsync(async (req, res, next) => {
  const newTask = await Task.create({
    taskName: req.body.taskName,
    isActive: req.body.isActive,
    state: req.body.state,
    progressState: req.body.progressState,
  });

  res.status(201).json({
    status: "success",
    data: {
      task: newTask,
    },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!task) return next(new AppError("Task not found.", 404));

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) return next(new AppError("Task not found.", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
