const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const userSchema = mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstname: String,
  lastname: String,
  email: String,
  administrator: {type: Boolean, default: false}
});

userSchema.pre('save', function(next) {
  const user = this;
  bcrypt.genSalt(saltRounds, function(err, salt) {
    if (err) throw err;
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) throw err;
      user.password = hash;
      next();
    });
  });
});

const User = mongoose.model('User', userSchema);
module.exports = User;
