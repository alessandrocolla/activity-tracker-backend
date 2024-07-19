const winston = require("winston");

const { combine, timestamp, json, colorize, printf } = winston.format;

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    debug: 5,
    trace: 6,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue",
    trace: "gray",
  },
};

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: "trace",
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

winston.addColors(customLevels.colors);

module.exports = logger;
