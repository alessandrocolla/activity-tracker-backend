const Activity = require("../models/activityModel");

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find();

    res.status(200).json({
      status: "success",
      results: activities.length,
      data: activities,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: activity,
    });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const newActivity = await Activity.create({
      taskName: req.body.taskName,
      taskID: req.body.taskID,
      activityDate: req.body.activityDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      notes: req.body.notes,
      userID: req.body.userID,
    });

    res.status(201).json({
      status: "success",
      data: {
        activity: newActivity,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        activity: activity,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
