const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

// POST -- everyone has access to create new User
router.post('/', auth.optional, (req, res, next) => {
  // TODO: this doesn't check for dup-username
  // TODO: this doesn't have password restriction
  // TODO: this doesn't have email vaidation
  const { body: { user } } = req;
  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required'
      }
    });
  } else if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required'
      }
    });
  }

  const newUser = new Users(user);
  newUser.setPassword(user.password);

  return newUser.save().then(() => {
    res.json({user: newUser.toAuthJSON()})
  });
});

// POST -- everyone has access to login
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;
  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required'
      }
    });
  } else if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required'
      }
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    } else if (passportUser) {
      const loggedInUser = passportUser;
      loggedInUser.token = passportUser.generateJWT();

      return res.json({ user: loggedInUser.toAuthJSON()});
    }
    return status(400).info;
  })(req, res, next);
});

// GET -- only authenticated users have access
router.get('/current', auth.required, (req, res, next) => {
  const { payload: {id }} = req;

  return Users.findById(id).then((user) => {
    if (!user) {
      return res.sendStatus(400);
    }

    return res.json({user: user.toAuthJSON()});
  });
});

module.exports = router;