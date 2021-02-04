const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let User;
const { ObjectId } = mongoose.Schema;
const userSchema = new mongoose.Schema({
  last_login: {
    type: Date,
    required: false,
  },
  name: {
    type: String, 
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  setPasswordDate: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  passwordAttempt: {
    type: Number,
    default: 0,
  },
  create: {
    at: {
      type: Date,
      default: Date.now,
    },
  },

  delete: {
    at: Date,
  },
});

userSchema.plugin(uniqueValidator);
User = mongoose.model('User', userSchema);
module.exports = User;
