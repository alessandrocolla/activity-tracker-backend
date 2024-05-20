const Activity = require("../models/activityModel");
const AppError = require("../utils/appError");

exports.getActivities = catchAsync(async (req, res, next) => {
  const activities = await Activity.find();

  res.status(200).json({
    status: "success",
    results: activities.length,
    data: activities,
  });
});

exports.getActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) return next(new AppError("Activity not found.", 404));

  res.status(200).json({
    status: "success",
    data: activity,
  });
});

exports.createActivity = catchAsync(async (req, res, next) => {
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
});

exports.updateActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!activity) return next(new AppError("Activity not found.", 404));

  res.status(200).json({
    status: "success",
    data: {
      activity: activity,
    },
  });
});

exports.deleteActivity = catchAsync(async (req, res, next) => {
  await Activity.findByIdAndDelete(req.params.id);

  if (!activity) return next(new AppError("Activity not found.", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
