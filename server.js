const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 4200;

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => {
  console.log("Connected to DB successfully");
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
