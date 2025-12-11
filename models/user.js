const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;
const userSchema = mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String },
  email: { type: String, unique: true, required: true },
  administrator: { type: Boolean, default: false },
  roles: [{ type: String, enum: ['user', 'chief'], default: 'user' }],
  settings: {
    sortOrder: { type: String, enum: ['desc', 'asc'], default: 'desc' }
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    reqiured: true,
    default: 'active'
  }
});

userSchema.pre('save', async function() {
  const user = this;
  const hash = await bcrypt.hash(user.password, saltRounds);
  user.password = hash;
});

const User = mongoose.model('User', userSchema);
module.exports = User;
