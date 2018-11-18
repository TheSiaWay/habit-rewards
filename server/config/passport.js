const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Users = mongoose.model('Users');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, async (email, password, done) => {
  try {
    const user = await Users.findOne({ email });
    if (!user || !user.validatePassword(password)) {
      return done(null, false, {
        errors: { 'email or password': 'is invalid'}
      });
    }
    return done(null, user);
  } catch(e) {
    done();
  }
}));