const Task = require("../models/taskModel");

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();

    res.status(200).json({
      status: "success",
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err });
  }
};

exports.createTask = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
