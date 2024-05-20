const Task = require("../models/taskModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { getAll, getOne, updateOne, deleteOne } = require("./handlerFactory");

exports.getTasks = getAll(Task);
exports.getTask = getOne(Task);
exports.updateTask = updateOne(Task);
exports.deleteTask = deleteOne(Task);

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
