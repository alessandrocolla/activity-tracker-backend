const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getAll, getOne, updateOne, deleteOne } = require("./handlerFactory");

exports.getUsers = getAll(User);
exports.getUser = getOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    passwordChangedAt: req.body.passwordChangedAt,
    propic: req.body.propic,
    codiceFiscale: req.body.codiceFiscale,
    isAccepted: req.body.isAccepted,
    isActive: req.body.isActive,
    creationDate: req.body.creationDate,
  });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

exports.getUserActivities = catchAsync(async (req, res, next) => {
  const userID = req.params.id;

  const user = await User.findById(userID);
  if (!user) return next(new AppError("User not found.", 404));

  const userActivities = await Activity.find({ userID: userID });

  res.status(200).json({
    status: "success",
    results: userActivities.length,
    data: {
      userActivities,
    },
  });
});

exports.updateUserActivities = catchAsync(async (req, res, next) => {
  const { userID, activityID } = req.params;

  const user = await User.findById(userID);
  if (!user) return next(new AppError("User not found.", 404));

  const updatedUserActivity = await Activity.findOneAndUpdate({ _id: activityID, userID: userID }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedUserActivity) return next(new AppError("User activity not found.", 404));

  res.status(200).json({
    status: "success",
    data: {
      updatedUserActivity,
    },
  });
});
