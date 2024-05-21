const User = require("../models/userModel");
const sendEmail = require("./email");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");

const emailConstructor = catchAsync(async (email, messageOption, req, res, next) => {
  try {
    const user = await User.findOne({ email });

    if (!user) return next(new AppError("No user found with that email.", 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    const message = `${messageOption} ${resetURL}`;

    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes).",
      text: message,
    });

    return true;
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending the email, please try again later.", 500));
  }
});

module.exports = emailConstructor;
