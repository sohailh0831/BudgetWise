const express = require('express');
const _ = require('lodash');
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
const BudgetFunctions = require('../helper/Budget');

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

router.post('/dashboard/add-budget', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let budgetName = req.body.budgetName;
  let budgetAllowance = req.body.budgetAllowance;
  let budgetStartDate = req.body.startDate;
  let budgetEndDate = req.body.endDate;
  req.checkBody('budgetName', 'Budget Name field is required.').notEmpty();
  req.checkBody('budgetAllowance', 'Budget Allowance field is required.').notEmpty();
  req.checkBody('startDate', 'Budget Start Date field is required.').notEmpty();
  req.checkBody('endDate', 'Budget End Date field is required.').notEmpty();
  let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/dashboard');
	  }
  let currentDateSeconds = new Date();
  let budgetStartDateSeconds = new Date(budgetStartDate);
  let budgetEndDateSeconds = new Date(budgetEndDate);
  if (budgetStartDateSeconds.getTime() > budgetEndDateSeconds.getTime()) {
    req.flash('error', 'Budget End Date cannot be before Budget Start Date.');
    return res.redirect('/dashboard');
  } else if (currentDateSeconds.getTime() > budgetEndDateSeconds.getTime()) {
    req.flash('error', 'Budget End Date cannot be before the current date.');
    return res.redirect('/dashboard');
  }
  let con = mysql.createConnection(dbInfo);
  let budgetID = uuidv4();
  con.query(`INSERT INTO budgets (id, name, allowance, startDate, endDate, user) VALUES (${mysql.escape(budgetID)}, ${mysql.escape(budgetName)}, ${mysql.escape(budgetAllowance)}, ${mysql.escape(budgetStartDate)}, ${mysql.escape(budgetEndDate)}, ${mysql.escape(req.user.identifier)})`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        req.flash('error', 'Check the fields and ensure proper format when creating a new budget.');
        return res.redirect('/dashboard');
    }
    con.end();
    req.flash('success', 'Budget successfully created.');
    return res.redirect('/dashboard');
  });
});

router.post('/dashboard/add-expense', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let expenseName = req.body.expenseName;
  let expensePrice = req.body.expensePrice;
  let recurringExpense = req.body.recurringExpense;
  let recurringTime = req.body.recurringTime;
  let recurringEndDate = req.body.recurringEndDate;
  let expenseCategoryID = req.body.category;
  req.checkBody('expenseName', 'Expense name field is required.').notEmpty();
  req.checkBody('expensePrice', 'Expense price field is required.').notEmpty();
  req.checkBody('category', 'Category field is required.').notEmpty();
  if (recurringExpense === "yes") {
    req.checkBody('recurringEndDate', 'End Date for the recurring expense is required.').notEmpty();
    req.checkBody('recurringTime', 'Recurring Time Interval for the recurring expense is required.').notEmpty();
  }
  let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/dashboard');
	  }
  let con = mysql.createConnection(dbInfo);
  let expenseID = uuidv4();
  BudgetFunctions.addExpenseToBudgets(expensePrice, req.user.identifier, recurringExpense, recurringTime, recurringEndDate)
        .then(result => {
          if (result) {
            con.query(`UPDATE categories SET expenses=expenses+1 WHERE owner=${mysql.escape(req.user.identifier)} AND id=${mysql.escape(expenseCategoryID)};`, (error, results, fields) => {
              if (error) {
                  console.log(error.stack);
                  con.end();
                  return res.send();
              }
              con.query(`INSERT INTO expenses (id, name, price, category, user) VALUES (${mysql.escape(expenseID)}, ${mysql.escape(expenseName)}, ${mysql.escape(expensePrice)}, ${mysql.escape(expenseCategoryID)}, ${mysql.escape(req.user.identifier)})`, (error, results, fields) => {
                if (error) {
                    console.log(error.stack);
                    con.end();
                    return res.send();
                }
                if (recurringExpense === 'yes') {
                  con.query(`UPDATE expenses SET recurring=1 WHERE id=${mysql.escape(expenseID)};`, (error, results, fields) => {
                    if (error) {
                        console.log(error.stack);
                        con.end();
                        return res.send();
                    }
                    con.end();
                    req.flash('success', 'Expense successfully added.');
                    return res.redirect('/dashboard');
                  });
                } else {
                  con.end();
                  req.flash('success', 'Expense successfully added.');
                  return res.redirect('/dashboard');
                }
              });
            });
            
          }
        }).catch(error => {
          console.log(error);
          req.flash('error', 'You must have an active budget. Currently there are no active budgets.');
          return res.redirect('/dashboard');
        });
});


router.get('/categories', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  return res.render('platform/categories.hbs');
});

router.get('/budgets/:id', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM budgets WHERE id=${mysql.escape(req.params.id)} AND user=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    if (results.length === 1) {
      con.end();
      return res.render('platform/view-budget.hbs', {
        budget: results[0],
      });
    } else {
      req.flash('error', 'Error.');
      con.end();
      return res.redirect('/dashboard');
    }
  });
});

router.post('/budgets/get-user-budgets', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM budgets WHERE user=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    con.end();
    res.send(results);
  });
});


router.get('/budgetss/get-user-spend-per-category', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
     function formatDate(date){

        var dd = date.getDate();
        var mm = date.getMonth()+1;
        var yyyy = date.getFullYear();
        if(dd<10) {dd='0'+dd}
        if(mm<10) {mm='0'+mm}
        date = yyyy+'-'+mm+'-'+dd;
        return date
     }
    let dates = [];
    for (let i=6; i>=0; i--) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(formatDate(d));
    }
    let graph = {
          element: "m_morris_2",
          xkey: "y",
          data: [],
          ykeys: [],
          labels: []
     };
     let data = [];
  
  BudgetFunctions.getCategoriesByUser(req.user.identifier)
  .then(categories => {
        for (let i = 0; i < dates.length; i++) {
              let obj = {
                y: dates[i]
              }
              data.push(obj);
              for (let j = 0; j < categories.length; j++) {
                data[i][categories[j].id] = 0;
              }
        }
        let ykeys = [];
        let labels = [];
        for (let i = 0; i < categories.length; i++) {
          ykeys.push(`${categories[i].id}`);
          labels.push(categories[i].name);
        }
        graph.ykeys = ykeys;
        graph.labels = labels;
        graph.data = data;
        let computationData = BudgetFunctions.buildGraph(data, categories, req.user.identifier, dates[0]);
        computationData.then(resultData => {
          graph.data = resultData;
          console.log(graph);
          return res.send(graph);
        })
  }).catch(error => {
    console.log(error);
    return res.send();
  });
 
});

router.get('/testroute123', (req, res) => {
  res.send([{h: 'lol'}]);
})

router.post('/categories/get-user-categories', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM categories WHERE owner=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    con.end();
    res.send(results);
  });
});

router.get('/category/:id', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  return res.render('platform/view-category.hbs');
});

router.post('/category-expenses/:id', (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM expenses WHERE category=${mysql.escape(req.params.id)} AND user=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    if (results.length >= 1) {
      con.end();
      return res.send(results);
    } else {
      con.end();
      return res.send();
    }
  });
});



router.get('/settings', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  return res.render('platform/user-settings.hbs');
});


module.exports = router;
