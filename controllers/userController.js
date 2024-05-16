const User = require("../models/userModel");

exports.createUser = async (req, res, next) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
