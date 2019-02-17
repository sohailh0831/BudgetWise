const express = require('express');
const session = require('express-session');
const expressValidator = require('express-validator');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt= require('bcryptjs');
const path = require('path');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const uuidv4 = require('uuid/v4');
var passport = require("passport");
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

router.get('/dashboard', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SElECT * FROM categories WHERE owner='${req.user.identifier}';`, (error, categories, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    con.end();
    return res.render('platform/dashboard.hbs', {
      categories: categories,
      error: req.flash('error'),
      success: req.flash('success'),
    });
     
  });
});

router.post('/dashboard/add-category', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let categoryName = req.body.categoryName;
  if (categoryName.includes(' ')) {
      req.flash('error', 'Category name cannot contain spaces.');
      return res.redirect('/dashboard');
  }
  req.checkBody('categoryName', 'Category name field is required.').notEmpty();
  let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/dashboard');
	  }
  let con = mysql.createConnection(dbInfo);
  let categoryID = uuidv4();
  con.query(`INSERT INTO categories (id, name, owner) VALUES (${mysql.escape(categoryID)}, ${mysql.escape(categoryName)}, ${mysql.escape(req.user.identifier)})`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    con.end();
    req.flash('success', 'Category successfully created.');
    return res.redirect('/dashboard');
  });
});

router.post('/dashboard/add-expense', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let expenseName = req.body.expenseName;
  let expensePrice = req.body.expensePrice;
  let recurringExpense = req.body.recurringExpense;
  let recurringTime = req.body.recurringTime;
  let expenseCategoryID = req.body.category;
  req.checkBody('expenseName', 'Expense name field is required.').notEmpty();
  req.checkBody('expensePrice', 'Expense price field is required.').notEmpty();
  let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/dashboard');
	  }
  //let con = mysql.createConnection(dbInfo);
  let expenseID = uuidv4();
  /*
  con.query(`INSERT INTO expenses (id, name, price, recurring, category, user) VALUES (${mysql.escape(expenseID)}, ${mysql.escape(expenseName)}, ${mysql.escape(req.user.identifier)})`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    con.end();
    req.flash('success', 'Category successfully created.');
    return res.redirect('/dashboard');
  });
  */
  return res.send();
});





router.get('/settings', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  return res.render('platform/user-settings.hbs');
});


module.exports = router;

