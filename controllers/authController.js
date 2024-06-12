const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");
const { responseHandler } = require("./handlerFactory");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "Lax",
  };
  // Add this line when production is managed
  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  responseHandler(
    statusCode,
    {
      status: "success",
      token,
      data: {
        user,
      },
    },
    res,
  );
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      codiceFiscale: req.body.codiceFiscale,
    });

    responseHandler(
      201,
      {
        status: "success",
        data: {
          user: newUser,
        },
      },
      res,
    );
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError("No user found with email address", 404));

  try {
    let resetURL;
    const port = process.env.ANGULAR_PORT || 4200;
    const resetToken = user.createPasswordResetToken(false);
    await user.save({ validateBeforeSave: false });

    if (process.env.NODE_ENV === "production") {
      if (!req.query.uri) return next(new AppError("Error, page not found.", 404));

      resetURL = `${req.protocol}://${req.query.uri}:${port}/resetPassword/${resetToken}`;
    } else if (process.env.NODE_ENV === "development")
      resetURL = `${req.protocol}://${req.get("host")}/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

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
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }

  next();
};

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedOut", {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
    sameSite: "Lax",
  });

  res.status(200).json({
    status: "success",
  });
};

exports.protectRoute = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError("You are not logged in, log in to get access", 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) return next(new AppError("The user belonging to this token no longer exists.", 401));

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError("User recently changed password, please log in again.", 401));

  res.locals.user = currentUser;
  req.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Unauthorized: you do not have the permission to perform this action", 403));
    }
    next();
  };
};

exports.loginAuth = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) return next();

  if (!user.isActive || !user.isAccepted)
    return next(new AppError("User is not active or accepted, please contact administration for support.", 403));

  next();
});

exports.restrictToOwnerOrAdmin = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }

    if (
      req.user.role !== "admin" &&
      ((Model === User && document._id.toString() !== req.user.id) ||
        (Model === Activity && document.userID.toString() !== req.user.id))
    ) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }

    next();
  });
