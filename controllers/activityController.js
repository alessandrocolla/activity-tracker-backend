const Activity = require("../models/activityModel");

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find();

    res.status(200).json({
      status: "success",
      results: activities.length,
      data: activities,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
