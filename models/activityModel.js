const mongoose = require("mongoose");
const validator = require("validator");
const AppError = require("../utils/appError");

const ObjectId = mongoose.Schema.Types.ObjectId;

const activitySchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: [true, "An activity must have a task name"],
      trim: true,
    },
    taskID: {
      type: ObjectId,
      required: [true, "An activity must have an task ID"],
    },
    startTime: {
      type: Date,
      required: [true, "An activity must have a start time"],
    },
    endTime: {
      type: Date,
      required: [true, "An activity must have a end time"],
    },
    notes: {
      type: String,
      required: [true, "An activity must have some notes"],
      trim: true,
      maxlength: [100, "Notes must have less or equal than 100 characters"],
    },
    userID: {
      type: ObjectId,
      required: [true, "An activity must have an user ID"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

activitySchema.virtual("hours").get(function () {
  const hours = (this.endTime - this.startTime) / (60 * 60 * 1000);
  return hours.toFixed(2);
});

activitySchema.pre("save", async function () {
  const userID = this.userID;
  const startTime = this.startTime;
  const endTime = this.endTime;

  const existingActivities = await Activity.find({
    userID,
    startTime,
  });

  const overlappingActivities = existingActivities.find((activity) => {
    return (
      (startTime >= activity.startTime && startTime < activity.endTime) ||
      (endTime > activity.startTime && endTime <= activity.endTime) ||
      (startTime <= activity.startTime && endTime >= activity.endTime)
    );
  });

  if (overlappingActivities) {
    throw new AppError(
      "The time you entered intersects with the time of another activity you have already created.",
      403,
    );
  }
});

activitySchema.pre("save", function (next) {
  const today = new Date();
  const year = this.startTime.getFullYear().toString();

  const currentYear = new Date().getFullYear().toString();
  if (year !== currentYear) {
    return next(new AppError("Forbidden: the activity must be in the current year", 403));
  }

  if (this.startTime > today) {
    return next(new AppError("Forbidden: activity date cannot be in the future", 403));
  }

  const currentMonth = new Date().getMonth().toString();
  if (this.startTime.getMonth().toString() !== currentMonth) {
    return next(new AppError("Forbidden: activity date month must be the current month", 403));
  }

  next();
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
