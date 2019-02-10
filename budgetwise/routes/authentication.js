const express = require('express');
const session = require('express-session');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt= require('bcryptjs');
const uuidv4 = require('uuid/v4');
const passport = require("passport");
const flash = require('connect-flash');
var request = require("request");
const mysql = require('mysql');
let dbInfo = {
  host: "localhost",
  user: "root",
  password: "BudgetWise1234!",
  database : 'budgetwise'
};

const LocalStrategy = require('passport-local').Strategy;
const AuthenticationFunctions = require('../helper/Authentication');

// Index Route
router.get('/', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  return res.redirect('/dashboard');
});

// Login Route
router.get('/login', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  return res.render('platform/login.hbs', {
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.post('/login', AuthenticationFunctions.ensureNotAuthenticated, passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/logout', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  req.logout();
  req.session.destroy();
  return res.redirect('/login');
});

// Register Route
router.get('/register', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  return res.render('platform/register.hbs', {
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.post('/register', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let confirmPassword = req.body.password2;
  console.log(req.body);
  if (req.body.password.includes(' ') || req.body.password2.includes(' ')) {
      req.flash('error', 'Password cannot contain spaces.');
      return res.redirect('/register');
    }
    if (req.body.password.length < 4 || req.body.password2.length < 4) {
      req.flash('error', 'Password must be longer than 3 characters.');
      return res.redirect('/register');
    }
    req.checkBody('firstName', 'First Name field is required.').notEmpty();
    req.checkBody('lastName', 'Last Name field is required.').notEmpty();
    req.checkBody('username', 'Username field is required.').notEmpty();
    req.checkBody('email', 'Email field is required.').notEmpty();
    req.checkBody('password', 'New Password field is required.').notEmpty();
    req.checkBody('password2', 'Confirm New password field is required.').notEmpty();
	  req.checkBody('password2', 'New password does not match confirmation password field.').equals(req.body.password);
    let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/register');
	  }
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE username=${mysql.escape(req.body.username)} OR email=${mysql.escape(req.body.email)};`, (error, results, fields) => {
      if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
      }
      if (results.length === 0) {
        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(req.body.password, salt);
        con.query(`INSERT INTO users (id, email, username, password, first_name, last_name) VALUES (${mysql.escape(uuidv4())}, ${mysql.escape(req.body.email)}, ${mysql.escape(req.body.username)}, '${hashedPassword}', ${mysql.escape(req.body.firstName)}, ${mysql.escape(req.body.lastName)});`, (error, results, fields) => {
          if (error) {
            console.log(error.stack);
            con.end();
            return;
          }
          if (results) {
            console.log(`${req.body.email} successfully registered.`);
            con.end();
            req.flash('success', 'Successfully registered. You may now login.');
            return res.redirect('/login');
          } else {
            con.end();
            req.flash('error', 'Error Registering. Please try again.');
            return res.redirect('/register');
          }
        });
      } else {
        req.flash('error', "This username or email has already been registered.");
        con.end();
        return res.redirect('/register');
      }
    });
});

// Register Route
router.get('/forgot-password', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  return res.send('Forgot Password Page');
});




passport.use(new LocalStrategy({passReqToCallback: true,},
	function (req, username, password, done) {
      let con = mysql.createConnection(dbInfo);
      con.query(`SELECT * FROM users WHERE username=${mysql.escape(username)} OR email=${mysql.escape(username)};`, (error, results, fields) => {
        if (error) {
          console.log(error.stack);
          con.end();
          return;
        }
        if (results.length === 0) {
          con.end();
          return done(null, false, req.flash('error', 'Username/Email or Password is incorrect.'));
        } else {
          if (bcrypt.compareSync(password, results[0].password)) {
            console.log(`${username} successfully logged in.`);
            let user = {
                identifier: results[0].id,
                username: results[0].username,
                firstName: results[0].first_name,
                lastName: results[0].last_name,
            };
            con.end();
            return done(null, user);
          } else {
            con.end();
            return done(null, false, req.flash('error', 'Username/Email or Password is incorrect.'));
          }
        }
      });

}));

passport.serializeUser(function (uuid, done) {
	done(null, uuid);
});

passport.deserializeUser(function (uuid, done) {
  done(null, uuid);
});

module.exports = router;
