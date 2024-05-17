const mongoose = require("mongoose");

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
    type: String,
    required: [true, "An activity must have a start time"],
  },
  endTime: {
    type: String,
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
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
