const User = require("../models/userModel");
const Activity = require("../models/activityModel");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createUser = async (req, res, next) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userID = req.params.id;

    const user = await User.findOne({ _id: userID });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getUserActivities = async (req, res, next) => {
  try {
    const userID = req.params.id;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const userActivities = await Activity.find({ userID: userID });

    res.status(200).json({
      status: "success",
      results: userActivities.length,
      data: {
        userActivities,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
