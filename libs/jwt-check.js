const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const jwtAccessSecret = process.env.STAMP_JWT_ACCESS_SECRET || 'secret1';
const jwtRefreshSecret = process.env.STAMP_JWT_REFRESH_SECRET || 'secret2';
const jwtAccessExp = Number(process.env.STAMP_JWT_ACCESS_EXP) || 600;

exports.getNewToken = async function(refreshToken) {
  let decoded = undefined;
  try {
    decoded = jwt.verify(refreshToken, jwtRefreshSecret);
  } catch (err) {
    if (err.message === 'jwt expired') {
      return 'expired';
    }
    console.error(err.message);
    return 'error';
  }
  const user = await User.findById(decoded.sub);
  const payload = {
    sub: user._id,
    exp: Math.floor(Date.now() / 1000) + jwtAccessExp,
    username: user.username,
    admin: user.administrator
  };
  const accessToken = jwt.sign(payload, jwtAccessSecret);
  return {string: accessToken, user: decoded};
}

exports.verifyToken = function(accessToken) {
  let decoded = undefined;
  try {
    decoded = jwt.verify(accessToken, jwtAccessSecret);
  } catch (err) {
    if (err.message === 'jwt expired') {
        return 'expired';
      }
      console.error(err.message);
      return 'error';
    }
  return decoded;
}

exports.getUserProfileAndToken = async function(refreshToken) {
  let decoded = undefined;
  try {
    decoded = jwt.verify(refreshToken, jwtRefreshSecret);
  } catch (err) {
    if (err.message === 'jwt expired') {
      return 'expired';
    }
    console.error(err.message);
    return 'error';
  }
  const user = await User.findById(decoded.sub);
  const payload = {
    sub: user._id,
    exp: Math.floor(Date.now() / 1000) + jwtAccessExp,
    username: user.username,
    admin: user.administrator
  };
  const profile = {
    username: user.username,
    admin: user.administrator,
    fullname: [user.firstname, user.lastname].join(' '),
    email: user.email
  };
  const accessToken = jwt.sign(payload, jwtAccessSecret);
  const settings = user.settings;

  return {user: profile, token: accessToken, settings: settings};
}
