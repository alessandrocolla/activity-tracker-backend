const express = require("express");
const morgan = require("morgan");

const taskRouter = require("./routes/taskRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/tasks", taskRouter);

module.exports = app;
