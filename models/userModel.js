const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const firstLastNameRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;

const codiceFiscaleRegex =
  /^(?:[A-Z][AEIOU][AEIOUX]|[AEIOU]X{2}|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i;

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "You must put a firstName"],
    validate: {
      validator: function (el) {
        return firstLastNameRegex.test(el);
      },
      message: (props) => `${props.value} is not a valid first name!`,
    },
  },
  lastName: {
    type: String,
    required: [true, "You must put a lastName"],
    validate: {
      validator: function (el) {
        return firstLastNameRegex.test(el);
      },
      message: (props) => `${props.value} is not a valid last name!`,
    },
  },
  email: {
    type: String,
    required: [true, "You must put an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
    validate: [
      validator.isStrongPassword,
      "Password must be at least 8 characters long and must contain: at least one lowercase character, at least one uppercase character, at least one number and at least one symbol",
    ],
  },
  passwordConfirm: {
    type: String,
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
    unique: true,
    minlength: 16,
    maxlength: 16,
    validate: {
      validator: function (el) {
        return codiceFiscaleRegex.test(el);
      },
      message: (props) => `${props.value} is not a valid codiceFiscale (tax code)!`,
    },
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  creationDate: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.index({ codiceFiscale: 1 }, { unique: true });

userSchema.pre("validate", function (next) {
  if ((this.isNew && !this.password) || !this.passwordConfirm) {
    this.password = "aB3@E6FgH9Jk";
    this.passwordConfirm = "aB3@E6FgH9Jk";
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.isNew) {
    this.password = undefined;
    this.passwordConfirm = undefined;
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function (newAccount) {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = newAccount ? Date.now() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
