const https = require("https");
const querystring = require("querystring");
const AppError = require("../utils/appError");

const verifyCaptcha = (req, res) => {
  const token = req.body["g-recaptcha-response"];
  const secretKey = "6LeBbRsqAAAAAF6y0tHCVBM3n_UP3r2_v1QueIen";

  const postData = querystring.stringify({
    secret: secretKey,
    response: token,
  });

  const options = {
    hostname: "www.google.com",
    path: "/recaptcha/api/siteverify",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length,
    },
  };

  const request = https.request(options, (response) => {
    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      const result = JSON.parse(data);
      if(result.success) {
        let response = {
          success: true
        }
        res.status(200).send(JSON.stringify(response))
      }
      if (!result.success) {
        return (new AppError("Internal server error.", 500));
      }
    });
  });

  request.on("error", (error) => {
    res.status(500).send("Internal server error.");
  });

  request.write(postData);
  request.end();
};

module.exports = verifyCaptcha;
