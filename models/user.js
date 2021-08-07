const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  id: Number,
  login: String,
  password: String,
  firstname: String,
  lastname: String,
  email: String,
  administrator: {type: Boolean, default: false}
});

const User = mongoose.model('User', userSchema);
module.exports = User;
