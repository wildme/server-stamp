const mongoose = require('mongoose');
//const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstname: String,
  lastname: String,
  email: String,
  administrator: {type: Boolean, default: false}
});

//userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
module.exports = User;
