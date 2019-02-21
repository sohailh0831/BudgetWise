// Import NPM Modules
const _ = require('lodash');
const handlebars = require('handlebars');
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


function addExpenseToBudgets(expensePrice, userID, recurringExpense, recurringTime, recurringEndDate) {
  return new Promise(function(resolve, reject) {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM budgets WHERE user=${mysql.escape(userID)};`, (error, results, fields) => {
      if (error) {
        console.log(error.stack);
        con.end();
        reject(false);
      }
      if (results.length > 0) {
        let budgetsAdded = 0;
        for (let i = 0; i < results.length; i++) {
          let budgetStartDate = results[i].startDate.getTime();
          let budgetEndDate = results[i].endDate.getTime();
          let currentDate = new Date();
          currentDate = currentDate.getTime();
          if (currentDate >= budgetStartDate && currentDate <= budgetEndDate) {
            let newAmountSpent = Number(results[i].amountSpent);
            if (recurringExpense === 'yes') {
              let recurringEndDate2 = new Date(recurringEndDate);
              recurringEndDate2 = recurringEndDate2.getTime();
              if (recurringEndDate2 > budgetEndDate) {
                recurringEndDate2 = budgetEndDate;
                let days = Math.round((recurringEndDate2-currentDate)/(1000*60*60*24)) / Number(recurringTime);
                newAmountSpent = newAmountSpent + (days * Number(expensePrice));
              } else {
                let days = Math.round((recurringEndDate2-currentDate)/(1000*60*60*24)) / Number(recurringTime);
                newAmountSpent = newAmountSpent + (days * Number(expensePrice));
              }
            } else {
              newAmountSpent = newAmountSpent + Number(expensePrice);
            }
            budgetsAdded++;
            con.query(`UPDATE budgets SET amountSpent=${mysql.escape(newAmountSpent)} WHERE id=${mysql.escape(results[i].id)};`, (error, results, fields) => {
              if (error) {
                console.log(error.stack);
                con.end();
                reject(false);
              }
            });
          }
        }
        if (budgetsAdded > 0) {
          con.end();
          resolve(true);
        } else {
          con.end();
          reject(false);
        }
      } else {
        reject(false);
      }
    });
  })
}


module.exports = {
  addExpenseToBudgets,


}