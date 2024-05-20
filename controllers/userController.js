const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const userID = req.params.id;

  const user = await User.findOne({ _id: userID });

  if (!user) return next(new AppError("User not found.", 404));

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

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

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) return next(new AppError("User not found.", 404));

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) return next(new AppError("User not found.", 404));

  res.status(204).json({
    status: "success",
    data: null,
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
