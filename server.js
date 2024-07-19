const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const port = process.env.PORT || 3000;

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => {
  console.log("Connected to DB successfully");
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
  logger.info(`Server is running on port ${port}`);
});
