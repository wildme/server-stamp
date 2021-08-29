const passport = require('passport');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.js');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
    });
});

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'my_secret'
},
  function(jwt_payload, done) {
    User.findById(jwt_payload.sub, function(err, user) {
      if (err) { return done(err, false); }
      if (user) { return done(null, user); }
      else { return done(null, false); }
    });
  }));

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
     if (err) return done(err);
     if (!user) {
       return done(null, false, { message: 'Incorrect username' });
       }
      if (password === user.password) {
        return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password' });
          }
      });
    }
  ));

exports.init = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
};

exports.loginApi = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(info.message);
    req.logIn(user, (err) => {
      if (err)  return next(err);
      const payload = {
        sub: user._id,
        exp: Date.now() + 60000,
        username: user.username,
        admin: user.administrator
      };
      const token = jwt.sign(payload, 'my_secret');
      return res.cookie('jwt', token, {httpOnly: true}).json({ jwt: token });
      })
    })(req, res, next);
};

exports.tokenApi = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(403).json('Forbidden');
    const userData = { username: user.username, 
      admin: user.administrator,
      firstname: user.firstname }
    return res.status(200).json(userData);
  })(req, res, next);
};
