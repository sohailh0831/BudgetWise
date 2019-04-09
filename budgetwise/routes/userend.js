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
const moment = require('moment');
let dbInfo = {
  host: "localhost",
  user: "root",
  password: "BudgetWise1234!",
  database : 'budgetwise'
};
const LocalStrategy = require('passport-local').Strategy;
const AuthenticationFunctions = require('../helper/Authentication');
const BudgetFunctions = require('../helper/Budget');
const Notifications = require('../helper/Notifications');
const CurrencyConverter = require('../helper/CurrencyConverter');


router.get('/dashboard', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM categories WHERE owner='${req.user.identifier}';`, (error, categories, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    con.query(`SELECT * FROM special_budget_individual WHERE user='${req.user.identifier}';`, (error, individuals, fields) => {
      if (error) {
          console.log(error.stack);
          con.end();
          return res.send();
      }
      con.end();
      return res.render('platform/dashboard.hbs', {
        categories: categories,
        individuals: individuals,
        error: req.flash('error'),
        success: req.flash('success'),
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        pageName: 'Dashboard',
      });
    });
  });
});

router.get('/christmas-budget', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM special_budgets WHERE user=${mysql.escape(req.user.identifier)};`, (error, budgets, fields) => {
    if (error) {
      console.log(error.stack);
        con.end();
        return res.send();
    }
    if (budgets.length === 1) {
      con.query(`SELECT * FROM special_budget_individual WHERE user=${mysql.escape(req.user.identifier)};`, (error, individuals, fields) => {
        if (error) {
          console.log(error.stack);
            con.end();
            return res.send();
        }
        return res.render('platform/view-christmas-budget.hbs', {
          budget: budgets[0],
          individuals: individuals,
          pageName: 'Christmas Budget',
          error: req.flash('error'),
          success: req.flash('success'),
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          username: req.user.username,
        });
      });
    } else {
      con.end();
      req.flash('error', 'You do not have a christmas budget. First create one, and then try again.');
      return res.redirect('/dashboard');
    }
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

router.post('/dashboard/addmemo', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let memoin = req.body.memoinput;
  req.checkBody('memoinput', 'Cannot Save Empty Memo').notEmpty();
  let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/dashboard');
	  }


  let con = mysql.createConnection(dbInfo);
  //let categoryID = uuidv4();
  //UPDATE users SET memo WHERE id=${mysql.escape(req.body.individualChoice)};
  con.query(`UPDATE users SET memo = ${mysql.escape(memoin)} WHERE users.id = ${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    con.end();
    req.flash('success', 'Memo successfully updated.');
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

router.post('/dashboard/add-monthly-budget', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  req.checkBody('monthlyBudgetAllowance', 'Monthly Budget Allowance field is required.').notEmpty();
  let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/dashboard');
	  }
  let monthlyBudgetID = uuidv4();
  let startOfMonth = moment().add(1, 'months').startOf('month').format('YYYY-MM-DD');
  let endOfMonth = moment().add(1, 'months').endOf('month').format('YYYY-MM-DD');
  let monthName = moment().add(1, 'months').startOf("month").format('MMMM');
  monthName = monthName + ' Budget';
  let con = mysql.createConnection(dbInfo);
  con.query(`INSERT INTO budgets (id, name, allowance, startDate, endDate, user) VALUES (${mysql.escape(monthlyBudgetID)}, ${mysql.escape(monthName)}, ${mysql.escape(req.body.monthlyBudgetAllowance)}, ${mysql.escape(startOfMonth)}, ${mysql.escape(endOfMonth)}, ${mysql.escape(req.user.identifier)})`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        req.flash('error', 'Check the fields and ensure proper format when creating a new monthly budget.');
        return res.redirect('/dashboard');
    }
    con.end();
    req.flash('success', 'Monthly Budget successfully created.');
    return res.redirect('/dashboard');
  });
});

router.get('/dashboard/delete-christmas-budget', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`DELETE FROM special_budgets WHERE user=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
    if (error) {
      console.log(error);
      con.end();
      return res.send();
    }
    con.query(`DELETE FROM special_budget_individual WHERE user=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
      if (error) {
        console.log(error);
        con.end();
        return res.send();
      }
      req.flash('success', 'Deleted Christmas Budget.');
      return res.redirect('/dashboard');
    });
  });
});

router.post('/dashboard/add-christmas-budget', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  req.checkBody('budgetName', 'Budget Name field is required.').notEmpty();
  req.checkBody('budgetAllowance', 'Budget Allowance field is required.').notEmpty();
  let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/dashboard');
	  }
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM special_budgets WHERE user=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
    if (error) {
      console.log(error);
      con.end();
      return res.send();
    }
    if (results.length === 0) {
      con.query(`INSERT INTO special_budgets (id, name, allowance, user) VALUES (${mysql.escape(uuidv4())}, ${mysql.escape(req.body.budgetName)}, ${mysql.escape(req.body.budgetAllowance)}, ${mysql.escape(req.user.identifier)});`, (error, results, fields) => {
        if (error) {
          console.log(error);
          con.end();
          return res.send();
        } else {
          con.end();
          req.flash('success', 'Christmas Budget successfully created.');
          return res.redirect('/dashboard');
        }
      });
    } else {
      con.end();
      req.flash('error', 'You already have a Christmas Budget.');
      return res.redirect('/dashboard');
    }
  });
});

router.post(`/dashboard/add-christmas-expense`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  req.checkBody('expensePrice', 'Expense Price field is required.').notEmpty();
  req.checkBody('individualChoice', 'Individual Choice field is required.').notEmpty();
  let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/dashboard');
	  }
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM special_budget_individual WHERE id=${mysql.escape(req.body.individualChoice)};`, (error, results, fields) => {
    if (error) {
      console.log(error);
      con.end();
      return res.send();
    }
    if (results.length === 1) {
      con.query(`UPDATE special_budget_individual SET expense=expense+${Number(req.body.expensePrice)} WHERE id=${mysql.escape(req.body.individualChoice)};`, (error, results, fields) => {
        if (error) {
          console.log(error);
          con.end();
          return res.send();
        }
        con.end();
        req.flash('success', 'Expense successfully added.');
        return res.redirect('/dashboard');
      });
    } else {
      con.end();
      req.flash('error', 'Individual not found.');
      return res.redirect('/dashboard');
    }
  });
});

router.post('/dashboard/add-individual-to-christmas-budget', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  req.checkBody('individualName', 'Individual Name field is required.').notEmpty();
  let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/dashboard');
	  }
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM special_budgets WHERE user=${mysql.escape(req.user.identifier)};`, (error, special_budgets, fields) => {
    if (error) {
      console.log(error);
      con.end();
      return res.send();
    }
    if (special_budgets.length === 1) {
      con.query(`SELECT * FROM special_budget_individual WHERE user=${mysql.escape(req.user.identifier)};`, (error, individuals, fields) => {
        if (error) {
          console.log(error);
          con.end();
          return res.send();
        }
        let numIndividuals = 1;
        if (individuals.length > 0) {
          numIndividuals = Number(individuals.length) + 1;
        }
        con.query(`INSERT INTO special_budget_individual (id, special_budget, user, name, allowance) VALUES (${mysql.escape(uuidv4())}, ${mysql.escape(special_budgets[0].id)}, ${mysql.escape(req.user.identifier)}, ${mysql.escape(req.body.individualName)}, ${Number(special_budgets[0].allowance)/numIndividuals});`, (error, results, fields) => {
          if (error) {
            console.log(error);
            con.end();
            return res.send();
          }
          con.query(`UPDATE special_budget_individual SET allowance=${special_budgets[0].allowance}/${numIndividuals} WHERE user=${mysql.escape(req.user.identifier)};`, (error, resp, fields) => {
            if (error) {
              console.log(error);
              con.end();
              return res.send();
            }
            req.flash('success', 'Successfully added individual to the christmas budget.');
            return res.redirect('/dashboard');
          })
        });
      });
    } else {
      con.end();
      req.flash('error', 'You must have a christmas budget created in order to add an individual.');
      return res.redirect('/dashboard');
    }
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
  return res.render('platform/categories.hbs', {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      username: req.user.username,
      pageName: 'Categories',
  });
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
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        pageName: `Viewing Budget: ${results[0].name}`,
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
    for(let i = 0; i < results.length; i++) {
      results[i].allowance = results[i].allowance.toFixed(2);
      results[i].amountSpent = results[i].amountSpent.toFixed(2);
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
    let refDate = new Date();
    for (let i=refDate.getDate()-1; i>=0; i--) {
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
          return res.send(graph);
        })
  }).catch(error => {
    console.log(error);
    return res.send();
  });

});

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
  let con = mysql.createConnection(dbInfo);

//   var cat = "";
//   con.query(`SELECT * FROM categories WHERE id=${mysql.escape(req.params.id)} AND owner=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
//     if (error) {
//         console.log(error.stack);
//         con.end();
//     }
//     else if (results.length != 1) {
//       con.end();
//     } else {
//       cat = results[0].name;
//       //The app is executing the above line, but after it executes, cat is still just an empty string
//     }
//   });

//   console.log(cat);
//   if(cat == "Retirement") {
//     return res.render('platform/retirement.hbs');
//   } else {
//     return res.render('platform/view-category.hbs');
//   }
  return res.render('platform/view-category.hbs', {
    firstName: req.user.firstName,
      lastName: req.user.lastName,
      username: req.user.username,
      pageName: 'Viewing Category',
  });
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

router.get('/retirement', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  let retirementGoal = 0;

  con.query(`SELECT * FROM categories WHERE owner=${mysql.escape(req.user.identifier)};`, (error, categories, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].name === 'Retirement') {
        con.query(`SELECT * FROM expenses WHERE user=${mysql.escape(req.user.identifier)} AND category='${categories[i].id}';`, (error, expenses, fields) => {
          let sum = 0;
          if (error) {
              console.log(error.stack);
              con.end();
              return res.send();
          }
          for (let j = 0; j < expenses.length; j++) {
            sum += expenses[j].price;
          }

          let lastYear = new Date();
          lastYear.setDate(lastYear.getDate()-365);
          let year = [];
          for (let i = 0; i < expenses.length; i++) {
            if(expenses[i].creationDate > lastYear) {
               year.push(expenses[i]);
            }
          }
          let ySum = 0;
          for (let j = 0; j < year.length; j++) {
            ySum += year[j].price;
          }

          let lastMonth = new Date();
          lastMonth.setDate(lastMonth.getDate()-30);
          let month = [];
          for (let i = 0; i < expenses.length; i++) {
            if(expenses[i].creationDate > lastMonth) {
               month.push(expenses[i]);
            }
          }
          let mSum = 0;
          for (let j = 0; j < month.length; j++) {
            mSum += month[j].price;
          }

          con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
            if (error) {
              console.log(error.stack);
              con.end();
              return res.send();
            }
            if (results.length != 1) {
              con.end();
              return res.send();
            } else {
              retirementGoal = results[0].retirementGoal;

              let goal = retirementGoal - sum;
              if(goal < 0) {
                goal = 0;
              }

              let goalPercent = sum / retirementGoal;
              if (goalPercent > 1) {
                goalPercent = 1;
              }
              goalPercent *= 100;

              con.end();

              return res.render('platform/retirement.hbs', {
                retirementSum: sum,
                monthSum: mSum,
                yearSum: ySum,
                amountToGoal: goal,
                percentToGoal: goalPercent,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                username: req.user.username,
                pageName: 'Retirement Analytics',
              });
            }
          });
        });
      }
    }
  });
});

router.get('/expense-analytics', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);

  let expenseNames = [];
  let expenseFreqs = [];
  let mostPurchased = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    expenseNames.push([]);
    expenseFreqs.push([]);
    mostPurchased.push(-1);
  }

  con.query(`SELECT * FROM expenses WHERE user=${mysql.escape(req.user.identifier)};`, (error, expenses, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }

    for (let i = 0; i < expenses.length; i++) {
      let expenseDate = new Date(expenses[i].creationDate);
      let dayVal = expenseDate.getDay();
      let name = expenses[i].name.toLowerCase();
      let arrayLoc = expenseNames[dayVal].indexOf(name);
      if(arrayLoc == -1) {
        expenseNames[dayVal].push(name);
        expenseFreqs[dayVal].push(1);
      } else {
        expenseFreqs[dayVal][arrayLoc] += 1;
      }

      let mostIndex = mostPurchased[dayVal];
      if(mostIndex == -1 || expenseFreqs[dayVal][mostIndex] < expenseFreqs[dayVal][arrayLoc]) {
         mostPurchased[dayVal] = arrayLoc;
      }
    }

    let topExpenses = [];
    let finalFreqs = [];
    for(weekday = 0; weekday < 7; weekday++) {
      if(mostPurchased[weekday] != -1) {
        topExpenses.push(expenseNames[weekday][mostPurchased[weekday]]);
        finalFreqs.push(expenseFreqs[weekday][mostPurchased[weekday]]);
      } else {
        topExpenses.push('No expenses entered.')
        finalFreqs.push('-');
      }
    }

    con.end();

    return res.render('platform/expense-analytics.hbs', {
      expense0: topExpenses[0],
      expenseFrequency0: finalFreqs[0],
      expense1: topExpenses[1],
      expenseFrequency1: finalFreqs[1],
      expense2: topExpenses[2],
      expenseFrequency2: finalFreqs[2],
      expense3: topExpenses[3],
      expenseFrequency3: finalFreqs[3],
      expense4: topExpenses[4],
      expenseFrequency4: finalFreqs[4],
      expense5: topExpenses[5],
      expenseFrequency5: finalFreqs[5],
      expense6: topExpenses[6],
      expenseFrequency6: finalFreqs[6],
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      username: req.user.username,
      pageName: 'Expense Analytics',
    });
  });
});

router.get('/settings', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
    if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
    }
    if (results.length == 1) {
      con.end();
      return res.render('platform/user-settings.hbs', {
        user: results[0],
        error: req.flash('error'),
        success: req.flash('success'),
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        pageName: 'Settings',
      });
    } else {
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/dashboard');
    }
  });
});

router.post('/settings', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  if (Object.keys(req.body).length === 5) {
    console.log(req.body);
    let email = req.body.email;
    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;
    let newPassword2 = req.body.newPassword2;
    if (req.body.newPassword.includes(' ') || req.body.newPassword2.includes(' ')) {
      req.flash('error', 'New password cannot contain spaces.');
      return res.redirect('/settings');
    }
    if (req.body.currencyChoice !== "EUR" && req.body.currencyChoice !== "CAD" && req.body.currencyChoice !== "USD" && req.body.currencyChoice !== "INR" && req.body.currencyChoice !== "AUD") {
      console.log(req.body.currencyChoice)
      req.flash('error', 'Invalid currency choice.');
      return res.redirect('/settings');
    }
    req.checkBody('currentPassword', 'Current Password field is required.').notEmpty();
    req.checkBody('email', 'Email field is required.').notEmpty();
    req.checkBody('currencyChoice', 'Currency field is required.').notEmpty();
    req.checkBody('newPassword2', 'New password does not match confirmation password field.').equals(req.body.newPassword);
    let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/settings');
	  }
    if (req.body.newPassword.length > 0 && (req.body.newPassword.length < 4 || req.body.newPassword2.length < 4)) {
      req.flash('error', 'New Password must be longer than 3 characters.');
      return res.redirect('/settings');
    }
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
      if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
      }
      if (results.length == 1) {
        if (bcrypt.compareSync(req.body.currentPassword, results[0].password)) {
          let salt = bcrypt.genSaltSync(10);
          let hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);
          if (req.body.newPassword.length > 3) {
            let salt = bcrypt.genSaltSync(10);
            let hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);
            con.query(`UPDATE users SET password=${mysql.escape(hashedPassword)}, email=${mysql.escape(req.body.email)} WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
              if (error) {
                console.log(error.stack);
                con.end();
                return res.send();
              }
              con.end();
              req.flash('success', 'Profile successfully updated.');
              return res.redirect('/settings');
            });
          } else {
            if (results[0].currency !== req.body.currencyChoice) {
              CurrencyConverter.convert(results[0].currency, req.body.currencyChoice)
              .then(value => {
                con.query(`UPDATE expenses SET price=price*${value} WHERE user=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
                  if (error) {
                    console.log(error);
                    con.end();
                    return res.send();
                  }
                  con.query(`UPDATE budgets SET allowance=allowance*${value}, amountSpent=amountSpent*${value} WHERE user=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
                    if (error){
                      console.log(error);
                      con.end();
                      return res.send();
                    }
                    con.query(`UPDATE users SET email=${mysql.escape(req.body.email)}, currency=${mysql.escape(req.body.currencyChoice)} WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
                      if (error) {
                        console.log(error.stack);
                        con.end();
                        return res.send();
                      }
                      con.end();
                      req.flash('success', 'Profile successfully updated.');
                      return res.redirect('/settings');
                    });
                  });
                });
              }).catch(error => {
                console.log(error);
              })
            } else {
              con.query(`UPDATE users SET email=${mysql.escape(req.body.email)} WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
                if (error) {
                  console.log(error.stack);
                  con.end();
                  return res.send();
                }
                con.end();
                req.flash('success', 'Profile successfully updated.');
                return res.redirect('/settings');
              });
            }
          }
        } else {
          req.flash('error', 'Current password entered incorrectly.');
          return res.redirect('/settings');
        }
      } else {
        req.flash('error', 'Error.')
        con.end();
        return res.redirect('/settings');
      }
    });
  }
  else if (Object.keys(req.body).length === 3) {
    if (req.body.newPassword.includes(' ') || req.body.newPassword2.includes(' ')) {
      req.flash('error', 'New password cannot contain spaces.');
      return res.redirect('/settings');
    }
    req.checkBody('newPassword2', 'New password does not match confirmation password field.').equals(req.body.newPassword);
    req.checkBody('email', 'Email field is required.').notEmpty();
    let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/settings');
	  }
    if (req.body.newPassword.length > 0 && (req.body.newPassword.length < 4 || req.body.newPassword2.length < 4)) {
      req.flash('error', 'New Password must be longer than 3 characters.');
      return res.redirect('/settings');
    }
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE email=${mysql.escape(req.body.email)};`, (error, results, fields) => {
      if (error) {
          console.log(error.stack);
          con.end();
          return res.send();
      }
      if (results.length == 0) {
        if (req.body.newPassword.length > 3) {
          let salt = bcrypt.genSaltSync(10);
          let hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);
          con.query(`UPDATE users SET parental_username=${mysql.escape(req.body.email)}, parental_password=${mysql.escape(hashedPassword)} WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
            if (error) {
              console.log(error.stack);
              con.end();
              return res.send();
            }
            req.flash('success', 'Parental Account successfully updated.');
            con.end();
            return res.redirect('/settings');
          });
        } else {
          con.query(`UPDATE users SET parental_username=${mysql.escape(req.body.email)} WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
            if (error) {
              console.log(error.stack);
              con.end();
              return res.send();
            }
            req.flash('success', 'Parental Account successfully updated.');
            con.end();
            return res.redirect('/settings');
          });
        }
      } else {
        req.flash('error', 'This email cannot be used.');
        con.end();
        return res.redirect('/settings');
      }
    });
  } else if (Object.keys(req.body).length === 2 || Object.keys(req.body).length === 1) {
    let con = mysql.createConnection(dbInfo);
    if (Number(req.body.notificationFrequency) != 0 && Number(req.body.notificationFrequency) != 1 && Number(req.body.notificationFrequency) != 2) {
      con.end();
      req.flash('error', 'Incorrect value for notification frequency.');
      return res.redirect('/settings');
    }
    if (Object.keys(req.body).length === 2) {
      con.query(`UPDATE users SET notifications=1, notification_frequency=${mysql.escape(req.body.notificationFrequency)} WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
        if (error) {
          console.log(error.stack);
          con.end();
          return res.send();
        }
        con.end();
        req.flash('success', 'Successfully updated notification settings.');
        return res.redirect('/settings');
      });
    } else {
      con.query(`UPDATE users SET notifications=0, notification_frequency=${mysql.escape(req.body.notificationFrequency)} WHERE id=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
        if (error) {
          console.log(error.stack);
          con.end();
          return res.send();
        }
        con.end();
        req.flash('success', 'Successfully updated notification settings.');
        return res.redirect('/settings');
      });
    }
  } else {
    console.log(req.body);
    req.flash('error', 'Error.');
    return res.redirect('/settings');
  }
});

router.get(`/old`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  res.render('platform/user-settings-old');
});


module.exports = router;
