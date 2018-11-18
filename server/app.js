const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const errorHandler = require('errorhandler');


// configure mongoose's promise
mongoose.promise = global.promise;

// configure isProduction
const isProduction = process.env.NODE_ENV === 'production';

// initiate app
const app = express();

// configure app
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// configure session
app.use(session({
  secret: 'secret', // TODO: replace this secret variable
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}));

if (!isProduction) {
  app.use(errorHandler());
}

// configure mongoose
mongoose.connect('mongodb://localhost/habits-local', { useNewUrlParser: true }); // TODO: replace this connection
mongoose.set('debug', true); // TODO: might need to set to false depending on environment?

// Error handlers & middleware
if (!isProduction) {
  app.use((error, req, res) => {
    res.status(error.status || 500);

    res.json({
      errors: {
        message: error.message,
        error
      }
    });
  });
}

app.use((error, req, res) => {
  res.status(error.status || 500);

  res.json({
    errors: {
      message: error.message,
      error: {}
    }
  });
});

app.listen(8000, () => console.log('Server running on http://localhost:8000/'));