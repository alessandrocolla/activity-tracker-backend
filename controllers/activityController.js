const Activity = require("../models/activityModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { getAll, getOne, updateOne, deleteOne } = require("./handlerFactory");

exports.setUserID = catchAsync(async (req, res, next) => {
  // allow Nested Routes
  if (req.params.userID) req.body.user = req.params.userID;
  next();
});

exports.getActivities = getAll(Activity);
exports.getActivity = getOne(Activity);
exports.updateActivity = updateOne(Activity);
exports.deleteActivity = deleteOne(Activity);

exports.createActivity = catchAsync(async (req, res, next) => {
  if (req.user.role === "user") req.body.userID = req.user._id;

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

exports.personalActivities = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const userActivities = await Activity.find({ userID: userID });

  res.status(200).json({
    status: "success",
    results: userActivities.length,
    data: {
      userActivities,
    },
  });
});
