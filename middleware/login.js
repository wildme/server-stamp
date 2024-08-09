const passport = require('passport');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user.js');

const jwtAccessSecret = process.env.STAMP_JWT_ACCESS_SECRET || 'secret1';
const jwtRefreshSecret = process.env.STAMP_JWT_REFRESH_SECRET || 'secret2';
const jwtCookieAge = Number(process.env.STAMP_JWT_COOKIE_AGE) || 28800000;
const jwtAccessExp = Number(process.env.STAMP_JWT_ACCESS_EXP) || 600;
const jwtRefreshExp = Number(process.env.STAMP_JWT_REFRESH_EXP) || 28800;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({username: username})
      .then(user => {
        if (!user) return done(null, false, {message: 'Incorrect username'});
        bcrypt.compare(password, user.password, function(err, result) {
          if (result) return done(null, user);
          else return done(null, false, {message: 'Incorrect password'});
        });
      })
      .catch((err) => {return done(err);});
  }
));

exports.init = (app) => {
  app.use(passport.initialize());
};

exports.logoutApi = (req, res) => {
  req.logOut(function(err) {
    if (err) return next(err);
    return res.clearCookie('jwt').sendStatus(200);
  });
};

exports.loginApi = (req, res, next) => {
  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      console.log(info.message);
      return res.sendStatus(401);
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      const accessToken_payload = {
        sub: user._id,
        exp: Math.floor(Date.now() / 1000) + jwtAccessExp,
        username: user.username,
        admin: user.administrator
      };

      const refreshToken_payload = {
        sub: user._id,
        exp: Math.floor(Date.now() / 1000) + jwtRefreshExp,
        username: user.username,
        admin: user.administrator
      };

      const profile = {
        username: user.username,
        admin: user.administrator,
        fullname: [user.firstname, user.lastname].join(' '),
        email: user.email
      };

      const accessToken = jwt.sign(accessToken_payload, jwtAccessSecret);
      const refreshToken = undefined;
      const settings = user.settings;
      const roles = user.roles;

      if (!req.cookies['jwt']) {
        let refreshToken = jwt.sign(refreshToken_payload, jwtRefreshSecret);

        return res.status(200)
          .cookie('jwt', refreshToken, {httpOnly: true, maxAge: jwtCookieAge})
          .json({ user: profile, token: accessToken, settings: settings, roles: roles });
      }

      return res.json({user: profile, token: accessToken, settings: settings, roles: roles});
      })
    })(req, res, next);
};
