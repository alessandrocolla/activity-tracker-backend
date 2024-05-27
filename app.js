const express = require("express");
const morgan = require("morgan");

const userRouter = require("./routes/userRoutes");
const taskRouter = require("./routes/taskRoutes");
const activityRouter = require("./routes/activityRoutes");

const app = express();

// MIDDLEWARES

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"],
  }),
);

// ROUTERS

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/activities", activityRouter);

module.exports = app;
