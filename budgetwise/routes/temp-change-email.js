const express = require('express');
const session = require('express-session');
const router = express.Router();
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

router.post('/user-settings/change-email', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let newEmail = req.body.newEmail;
  let confirmEmail = req.body.confirmEmail;
  let user = req.user.username;

  req.checkBody('newEmail', 'New email field is required.').notEmpty();
  req.checkBody('confirmEmail', 'New email does not match email confirmation field.').equals(newEmail);

  let formErrors = req.validationErrors();
  if (formErrors) {
	    req.flash('error', formErrors[0].msg);
      return res.redirect('/user-settings');
  }

  con.query(`UPDATE users SET email=${mysql.escape()} WHERE username=${user}`, (error, results, fields) => {
    if (error) {
          console.log(error.stack);
          con.end();
          return;
    }
    if (results.length === 0) {
      req.flash('error', 'Error.');
      con.end();
      return res.redirect('/settings');
    } else if (results.length === 1) {
      con.end();
      return res.render('platform/settings.hbs', {
        email: results[0].email,
        error: req.flash('error'),
      });
    } else {
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/settings');
    }
  });
});
