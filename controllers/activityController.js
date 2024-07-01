const Activity = require("../models/activityModel");
const APIFeatures = require("../utils/apiFeatures");
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
  let filter = { userID: req.user.id };

  if (req.query.startTime) {
    filter.startTime = { $gte: new Date(req.query.startTime.gte) };
  }
  if (req.query.endTime) {
    const endTime = new Date(req.query.endTime.lte);
    endTime.setHours(23, 59, 59, 999);
    if (!filter.startTime) filter.startTime = {};
    filter.endTime = { $lte: endTime };
    req.query.endTime.lte = endTime;
  }
  if (req.query.taskName) filter.taskName = req.query.taskName;
  if (!req.query.isActive) filter.isActive = true || req.query.isActive;
  if (!req.query.isTaskActive) filter.isTaskActive = true || req.query.isTaskActive;

  const totalDocuments = await Activity.countDocuments(filter);

  const features = new APIFeatures(Activity.find(filter), req.query, "Activity")
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const userActivities = await features.query;

  res.status(200).json({
    status: "success",
    totalDocuments,
    results: userActivities.length,
    data: {
      userActivities,
    },
  });
});
