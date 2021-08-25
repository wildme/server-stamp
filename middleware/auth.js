const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db.js');
const User = require('../models/user.js');

//passport.use(User.createStrategy());
//passport.use(new LocalStartegy(User.authenticate()));
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) return done(err);
      if (!user) { 
        return done(null, false, { message: 'Incorrect username' })
      }
      if (password === user.password) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

exports.init = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
  };

exports.loginApi = (req, res) => {
  passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/login' })
};
    


