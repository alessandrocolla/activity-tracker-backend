const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const { getAll, getOne, updateOne, deleteOne } = require("./handlerFactory");
const APIFeatures = require("../utils/apiFeatures");

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

exports.uploadUserPhoto = upload.single("propic");

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

    try {
      let welcomeURL;
      const port = process.env.ANGULAR_PORT || 4200;
      const welcomeToken = user.createPasswordResetToken(true);
      await user.save({ validateBeforeSave: false });

      if (process.env.NODE_ENV === "production") {
        if (!req.query.uri) return next(new AppError("Error, page not found.", 404));

        welcomeURL = `${req.protocol}://${req.query.uri}:${port}/resetPassword/${welcomeToken}`;
      } else if (process.env.NODE_ENV === "development")
        welcomeURL = `${req.protocol}://${req.get("host")}/resetPassword/${welcomeToken}`;

      await new Email(user, welcomeURL).sendWelcome();

      return res.status(200).json({
        status: "success",
        message: "Token sent to mail successfully.",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError("There was an error sending an email, please try again later.", 500));
    }
  } else if (req.body.isActive === true) {
    await Activity.updateMany({ userID: req.params.id }, { isActive: true });
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError("This route is not for password updates. Please use /updateMyPassword", 400));

  let filteredBody;

  if (req.user.role === "user") {
    const { email, role, isAccepted, isActive } = req.body;
    if (email || role || isAccepted || isActive)
      return next(new AppError("Forbidden, you don't have the permission to change these information.", 403));

    filteredBody = filterObj(
      req.body,
      "firstName",
      "lastName",
      "codiceFiscale",
      "birthDate",
      "birthPlace",
      "residence",
      "position",
      "iban",
      "qualification",
    );
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

exports.getUserActivities = catchAsync(async (req, res, next) => {
  if (req.params.isActive) filter = { isActive: req.params.isActive };
  const filter = { userID: req.params.userID };

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

  const user = await User.findById(req.params.userID);

  if (!user) return next(new AppError("User not found.", 404));

  const counters = {};
  counters.documentsActive = await Activity.countDocuments({ ...filter, isActive: true });
  counters.documentsInactive = await Activity.countDocuments({ ...filter, isActive: false });
  counters.totalDocuments = counters.documentsActive + counters.documentsInactive;
  counters.documentsTaskActive = await Activity.countDocuments({ ...filter, isTaskActive: true });
  counters.documentsTaskInactive = await Activity.countDocuments({ ...filter, isTaskActive: false });

  let active = {};
  if (req.query.isActive && req.query.isTaskActive) {
    active["isActive"] = req.query.isActive;
    active["isTaskActive"] = req.query.isTaskActive;
  } else if (req.query.isActive) {
    active["isActive"] = req.query.isActive;
  } else if (req.query.isTaskActive) {
    active["isTaskActive"] = req.query.isTaskActive;
  } else {
    active;
  }

  counters.totalResultQueriesActive = await Activity.countDocuments({
    ...filter,
    ...active,
  });

  const features = new APIFeatures(Activity.find(filter), req.query, "Activity")
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const activities = await features.query;

  res.status(200).json({
    status: "success",
    counters,
    results: activities.length,
    data: {
      activities,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
