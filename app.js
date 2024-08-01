const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const logger = require("./logger");

const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const taskRouter = require("./routes/taskRoutes");
const activityRouter = require("./routes/activityRoutes");
const captchaRouter = require("./routes/captchaRoutes");

const app = express();

const morganMidlleware = morgan(":method :url :status :res[content-length] - :response-time ms", {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
});

app.use(morganMidlleware);

app.use("/public", express.static("public"));

const swaggerDocument = JSON.parse(fs.readFileSync("./swagger.json", "utf8"));
swaggerDocument.servers[0].url = swaggerDocument.servers[0].url.replace(
  "${ACTIVITY_TRACKER_IP}",
  process.env.ACTIVITY_TRACKER_IP,
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors({ origin: true, credentials: true }));

app.options("*", cors());

// MIDDLEWARES

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
      "taskName",
      "taskID",
      "startTime",
      "endTime",
      "taskName",
      "state",
      "progressState",
    ],
  }),
);

// ROUTERS

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/activities", activityRouter);
app.use("/api/v1/captcha", captchaRouter);

app.use(globalErrorHandler);

module.exports = app;
