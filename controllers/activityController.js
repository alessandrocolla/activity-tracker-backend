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
  const dateArray = req.body.activityDate.split("-");
  if (dateArray[0].length !== 4) return next(new AppError("Bad request: year must have exactly 4 digits", 400));
  if (dateArray[1].length !== 2 || dateArray[2].length !== 2) {
    return next(new AppError("Bad request: month and day must have exactly 2 digits (f.e. 01, 02, 03...)", 400));
  }

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
