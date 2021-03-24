const LocalStrategy = require('passport-local');
const User = require('../models/user');
const passport = require('passport');

const strategy = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'user not exists' });
    }

    const isPasswordValid = user.password === password;

    if (!isPasswordValid) {
      return done(null, false, { message: 'password incorrect' });
    }

    user.lastVisited = new Date();
    user.save();

    return done(null, user, { message: 'welcome' });
  } catch (e) {
    console.log(e);
    done(e);
  }
});

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, done);
});

module.exports = passport.use('local', strategy);
