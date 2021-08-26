const passport = require('passport');
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
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user)  return res.redirect('/login');
    req.logIn(user, (err) => {
      if (err)  return next(err);
      return res.redirect('/');
      })
    })(req, res, next);
};
