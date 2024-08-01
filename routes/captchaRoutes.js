const express = require("express");
const captchaController = require("../controllers/captchaController");

const router = express.Router();

router
  .route("/")
  .post(captchaController);

module.exports = router;
