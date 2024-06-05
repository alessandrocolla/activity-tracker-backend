const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const ObjectId = mongoose.Schema.Types.ObjectId;

const activitySchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: [true, "An activity must have a task name"],
    trim: true,
  },
  taskID: {
    type: ObjectId,
    required: [true, "An activity must have an task ID"],
  },
  activityDate: {
    type: Date,
    required: [true, "An activity must have an activity date"],
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
});

activitySchema.pre("save", async function () {
  const userID = this.userID;
  const activityDate = this.activityDate;
  const startTime = this.startTime;
  const endTime = this.endTime;

  const existingActivities = await Activity.find({
    userID,
    activityDate,
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

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
