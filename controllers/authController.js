const User = require("../models/userModel");

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
    // TODO : after the password are saved as hash
    // if (!user || !(await correctPassword(password, user.password))) {
    if (!user || !(password === user.password)) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const token = ""; // TODO : replace with actual token
    res.status(200).json({
      status: "success",
      token,
      message: "User logged in",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }

  next();
};
