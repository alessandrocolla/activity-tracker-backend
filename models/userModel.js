const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "You must put a firstName"],
  },
  lastName: {
    type: String,
    required: [true, "You must put a lastName"],
  },
  email: {
    type: String,
    required: [true, "You must put an email"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valide email"],
  },
  password: {
    type: String,
    required: [true, "You must put a password"],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: [true, "You must confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  propic: {
    type: String,
    default: "default.png",
  },
  codiceFiscale: {
    type: String,
    required: [true, "You must put a codiceFiscale (taxCode)"],
    minlength: 16,
    maxlength: 16,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  creationDate: Date,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
