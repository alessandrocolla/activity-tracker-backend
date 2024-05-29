const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
const fs = require("fs");
const handlebars = require("handlebars");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.url = url;
    this.from = `Activity Tracker <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          clientId: process.env.OAUTH_CLIENTID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(templateName, subject) {
    const html = fs.readFileSync(`${__dirname}/../views/emails/${templateName}.html`, "utf-8");
    const template = handlebars.compile(html);
    const htmlToSend = template({
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: htmlToSend,
      text: htmlToText.convert(htmlToSend),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Benvenuto in Activity Tracker!");
  }

  async sendPasswordReset() {
    await this.send("resetPassword", "Il tuo token per resettare la tua password (valido per 10 minuti).");
  }
};
