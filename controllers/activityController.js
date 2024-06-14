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
  req.body.activityDate = new Date(req.body.activityDate);

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
  let filter = {};
  if (req.params.activityDate) filter = { activityDate: req.params.activityDate };
  if (req.params.taskName) filter = { task: req.params.taskName };
  if (req.params.isActive) filter = { isActive: req.params.isActive };
  if (req.params._id) filter = { _id: req.params._id };
  filter = { userID: req.user.id };

  const totalDocuments = await Activity.countDocuments(filter);

  const features = new APIFeatures(Activity.find(filter), req.query).filter().sort().limitFields().paginate();

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
