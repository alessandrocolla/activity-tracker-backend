const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const emailConstructor = require("../utils/emailConstructor");
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
    propic: req.body.propic,
    codiceFiscale: req.body.codiceFiscale,
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

exports.changeStatus = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      isAccepted: req.body.isAccepted,
      isActive: req.body.isActive,
    },
    {
      new: true,
      runValidators: false,
    },
  );

  if (!user) return next(new AppError("User not found.", 404));

  if (req.body.isAccepted === true) {
    const messageOption =
      "Welcome aboard! Your confirm account token (valid for 7 days). In case you didn't confirm your password in time, you can request a reset password. Submit a PATCH request with your new password and passwordConfirm to: ";
    const subjectOption = "Your confirm account token (valid for 7 days).";
    const emailConstructorInstance = emailConstructor(user.email, messageOption, subjectOption);
    await emailConstructorInstance(req, res, next);
  }
});
