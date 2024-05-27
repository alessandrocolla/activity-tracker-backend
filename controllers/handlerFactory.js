const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const Activity = require("../models/activityModel");
const User = require("../models/userModel");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.activityDate) filter = { activityDate: req.params.activityDate };
    if (req.params.taskName) filter = { task: req.params.taskName };
    if (req.params.firstName) filter = { firstName: req.params.firstName };
    if (req.params.lastName) filter = { lastName: req.params.lastName };
    if (req.params._id) filter = { _id: req.params._id };
    filter = { isActive: true };

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();

    const document = await features.query;

    res.status(200).json({
      status: "success",
      results: document.length,
      data: { document },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) return next(new AppError("Document not found.", 404));

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
    const document = await Model.findByIdAndUpdate(req.params.id, { isActive: false });

    if (!document) return next(new AppError("Document not found.", 404));

    if (document.email) {
      await Activity.updateMany({ userID: req.params.id }, { isActive: false });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
