const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const activitySchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: [true, "A task must have a name"],
    trim: true,
  },
  taskID: {
    type: ObjectId,
    required: [true, "A task must have an ID"],
  },
  activityDate: {
    type: Date,
    required: [true, "A task must have an activity date"],
  },
  startTime: {
    type: String,
    required: [true, "A task must have a start time"],
  },
  endTime: {
    type: String,
    required: [true, "A task must have a end time"],
  },
  notes: {
    type: String,
    required: [true, "A task must have some notes"],
    trim: true,
    maxlength: [100, "Notes must have less or equal than 100 characters"],
  },
  userID: {
    type: ObjectId,
    required: [true, "Task must have an user ID"],
  },
});

const Activity = mongoose.model("Activity", activitySchema);

exports.Activity = Activity;
