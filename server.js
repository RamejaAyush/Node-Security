require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { Strategy } = require('passport-google-oauth20');
const { bigqueryInstance } = require('./Utils/bigqueryInstance');

// routes
const createRequest = require('./Routes/request.create');

const PORT = 3000;

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  console.log(`Google Profile:`, profile);
  done(null, profile);
};

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

/*
 * We can limit what we store in the brower using the bellow two functions
 */

// Serialize: Save the session to the user to the cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserial: Loading it from the cookie
passport.deserializeUser((id, done) => {
  done(null, id);
});

const app = express();
// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies
app.use(bodyParser.json());

app.use(helmet());

app.use(
  cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);

app.use(passport.initialize());
// Authenicates the session that being sent to the server, using keys
app.use(passport.session());

const checkLoggedIn = (req, res, next) => {
  // req.user, passport session that id for us.
  console.log('current user', req.user);
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn)
    return res.status(401).json({
      error: 'You must log in!',
    });
  next();
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/request', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'raiseRequest.html'));
});

app.use('/request/create', createRequest);

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email'],
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true,
  }),
  (req, res) => {
    console.log('Google Called us back!');
  }
);

app.get('/auth/logout', (req, res) => {
  // remove req.user from this req and terminates any logged in user, passport inbuild feature
  req.logout();
  return res.redirect('/');
});

app.get('/secret', checkLoggedIn, (req, res) => {
  return res.send('Your Secret Value is: GGEZNOOB');
});

app.get('failure', (req, res) => {
  return res.send('Failed To log in!');
});

const startServer = async () => {
  const bigquery = await bigqueryInstance('./config/config.json');
  const projectId = bigquery.projectId;
  https
    .createServer(
      {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem'),
      },
      app
    )
    .listen(PORT, () => {
      console.log(`Bigquery connected with project: ${projectId}`);
      console.log(`server is running on https://localhost:${PORT}`);
    });
};

startServer();
