const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.find();

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

    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) return next(new AppError("Document not found.", 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
