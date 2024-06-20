const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const Activity = require("../models/activityModel");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.startTime) filter = { startTime: req.params.startTime };
    if (req.params.taskName) filter = { task: req.params.taskName };
    if (req.params.firstName) filter = { firstName: req.params.firstName };
    if (req.params.lastName) filter = { lastName: req.params.lastName };
    if (req.params._id) filter = { _id: req.params._id };
    filter = { isActive: true };

    const totalDocuments = await Model.countDocuments(filter);

    const features = new APIFeatures(Model.find(filter), req.query, Model.modelName)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const document = await features.query;

    res.status(200).json({
      status: "success",
      totalDocuments,
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
          propic: document.propic,
          codiceFiscale: document.codiceFiscale,
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
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) return next(new AppError("Document not found.", 404));

    if (document.role === "user") {
      res.status(200).json({
        status: "success",
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          propic: req.body.propic,
          codiceFiscale: req.body.codiceFiscale,
        },
      });
    } else {
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
