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
const uuidv1 = require('uuid/v1');
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
  return res.render('platform/dashboard.hbs');
});





router.get('/settings', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  return res.render('platform/user-settings.hbs');
});


module.exports = router;
