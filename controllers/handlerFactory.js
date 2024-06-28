const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const Activity = require("../models/activityModel");
const User = require("../models/userModel");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.startTime) filter = { startTime: req.params.startTime };
    if (req.params.endTime) filter = { endTime: req.params.endTime };
    if (req.params.taskName) filter = { task: req.params.taskName };
    if (req.params.firstName) filter = { firstName: req.params.firstName };
    if (req.params.lastName) filter = { lastName: req.params.lastName };
    if (req.params.isAccepted) filter = { isAccepted: req.params.isAccepted };
    if (req.params._id) filter = { _id: req.params._id };
    if (req.user.role !== "admin") filter = { isActive: true };

    const counters = {};
    counters.documentsActive = await Model.countDocuments(filter);
    counters.documentsInactive = await Model.countDocuments({ ...filter, isActive: false });
    counters.totalDocuments = counters.documentsActive + counters.documentsInactive;

    if (Model.modelName === "User") {
      counters.usersAccepted = await Model.countDocuments({ ...filter, isAccepted: true });
      counters.usersNotAccepted = await Model.countDocuments({ ...filter, isAccepted: false });
    }

    const features = new APIFeatures(Model.find(filter), req.query, Model.modelName)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const document = await features.query;

    res.status(200).json({
      status: "success",
      counters,
      results: document.length,
      data: { document },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) return next(new AppError("Document not found.", 404));
    if (document.role) {
      return res.status(200).json({
        status: "success",
        data: {
          firstName: document.firstName,
          lastName: document.lastName,
          propic: `${req.protocol}://${req.hostname}:${process.env.PORT}/public/img/users/${document.propic}`,
          codiceFiscale: document.codiceFiscale,
          email: document.email,
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: { document },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let document = await Model.findById(req.params.id);

    if (!document) return next(new AppError("Document not found.", 404));

    if (document.role === "user") {
      document = await document.updateOne(req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        status: "success",
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          propic: req.body.propic,
          codiceFiscale: req.body.codiceFiscale,
        },
      });
    } else if (document.userID && req.body.isActive === true) {
      const userDoc = await User.findById(document.userID);

      if (!userDoc) return next(new AppError("User not found.", 404));
      else if (userDoc.isActive === false)
        return next(new AppError("Cannot activate the activity of an unactive user.", 403));

      document = await document.updateOne(req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        status: "success",
        data: {
          document,
        },
      });
    } else if (document.progressState) {
      if (!req.body.isActive) {
        await Activity.updateMany({ taskID: req.params.id }, { isTaskActive: false });
        req.body.progressState = 100;
        req.body.state = "Done";
      } else if (req.body.isActive) {
        await Activity.updateMany({ taskID: req.params.id }, { isTaskActive: true });
        req.body.progressState = req.body.progressState || 99;
        req.body.state = req.body.state || "In progress";
      }
      document = await document.updateOne(req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        status: "success",
        data: {
          document,
        },
      });
    } else {
      document = await document.updateOne(req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        status: "success",
        data: {
          document,
        },
      });
    }
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) return next(new AppError("Document not found.", 404));
    if (document.role === "admin") return next(new AppError("Forbidden: Cannot delete an admin", 403));

    await document.updateOne({ isActive: false });

    if (document.email) {
      await Activity.updateMany({ userID: req.params.id }, { isActive: false });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

/**
 * To filter response data in Production
 * @param {number} statusCode
 * @param {object} objForJson
 * @param {*} res Response
 */
exports.responseHandler = (statusCode, objForJson, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(statusCode).json({
      status: objForJson.status,
      token: objForJson.token,
      data: {
        role: objForJson.data.user.role,
        id: objForJson.data.user.id,
      },
    });
  }

  res.status(statusCode).json(objForJson);
};
