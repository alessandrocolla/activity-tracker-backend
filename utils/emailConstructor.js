const User = require("../models/userModel");
const sendEmail = require("./email");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");

const emailConstructor = (email, messageOption, subjectOption) =>
  catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email });

    if (!user) return next(new AppError("No user found with that email.", 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    const message = `${messageOption} ${resetURL}`;

    try {
      await sendEmail({
        email: user.email,
        subject: subjectOption,
        text: message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to mail successfully.",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError("There was an error sending the email, please try again later.", 500));
    }
  });

module.exports = emailConstructor;
