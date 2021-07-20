const mongoose = require('mongoose');

const user = mongoose.Schema({
  id: Number,
  login: String,
  password: String,
  firstname: String,
  lastname: String,
  email: String,
  administrator: Boolean,
});
