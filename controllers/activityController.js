const Activity = require("../models/activityModel");

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
