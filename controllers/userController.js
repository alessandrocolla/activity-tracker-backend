const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const emailConstructor = require("../utils/emailConstructor");
const { getAll, getOne, updateOne, deleteOne } = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload an image.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const deletePhotoFromServer = catchAsync(async (photo) => {
  const path = `${__dirname}/../public/img/users/${photo}`;
  await fs.unlink(path, (err) => {
    if (err) return console.log(err);
  });
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`, (err) => {
      if (err) {
        return next(new AppError("Error processing image", 500));
      }
      next();
    });
});

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
    if (req.body.isActive === true) await Activity.updateMany({ userID: req.params.id }, { isActive: true });

    const messageOption =
      "Welcome aboard! Your confirm account token (valid for 7 days). In case you didn't confirm your password in time, you can request a reset password. Submit a PATCH request with your new password and passwordConfirm to: ";
    const subjectOption = "Your confirm account token (valid for 7 days).";
    const emailConstructorInstance = emailConstructor(user.email, messageOption, subjectOption);
    await emailConstructorInstance(req, res, next);
  } else if (req.body.isActive === true) {
    await Activity.updateMany({ userID: req.params.id }, { isActive: true });

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError("This route is not for password updates. Please use /updateMyPassword", 400));

  let filteredBody;

  if (req.user.role === "user") {
    filteredBody = filterObj(req.body, "firstName", "lastName", "codiceFiscale");
  } else if (req.user.role === "admin") {
    filteredBody = req.body;
  }

  if (req.file) {
    filteredBody.propic = req.file.filename;
    if (req.user.propic !== "default.png") {
      await deletePhotoFromServer(req.user.propic);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

  res.status(200).json({
    status: "success",
    message: "Data updated successfully.",
    data: {
      updatedUser,
    },
  });
});
