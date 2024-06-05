const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
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
      const welcomeToken = user.createPasswordResetToken(true);
      await user.save({ validateBeforeSave: false });

      const welcomeURL = `${req.protocol}://${req.get("host")}/reset-password/${welcomeToken}`;

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
      return next(new AppError("Forbidden, you don't have the permission to change these informations.", 403));

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
