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

function getCategoriesByUser(userID) {
  return new Promise(function(resolve, reject) {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM categories WHERE owner=${mysql.escape(userID)} ORDER BY name;`, (error, categories, fields) => {
        if (error) {
            console.log(error.stack);
            con.end();
            return reject(error);
        }
        con.end();
        return resolve(categories);
    });
  })
}

function getExpensesFromUserAndDate(userID, date, data, categories) {
  return new Promise(function(resolve, reject) {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM expenses WHERE user=${mysql.escape(userID)} AND creationDate >= ${date} ORDER BY creationDate;`, (error, expenses, fields) => {
      if (error) {
        console.log(error.stack);
        con.end();
        return reject(error);
      }
      for (let i = 0; i < expenses.length; i++) {
        for (let j = 0; j < data.length; j++) {
          let d1 = new Date(expenses[i].creationDate);
          d1.setHours(0,0,0,0);
          let d2 = new Date(data[j].y);
          if (d1.getTime() == d2.getTime()) {
            data[j][expenses[i].category] = data[j][expenses[i].category] + expenses[i].price;
            break;
          }
        }
      }
      resolve(data);
    });
  })
}

function getTopFiveItems(userID) {
  return new Promise(function(resolve, reject) {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM expenses WHERE user=${mysql.escape(userID)} ORDER BY name;`, (error, expenses, fields) => {
        if (error) {
            console.log(error.stack);
            con.end();
            return reject(error);
        }
        var items = new Array();
        var prices = new Array();
        for (let i = 0; i < expenses.length; i++) {
          if(items.includes(expenses[i].name)) {
            var index = items.indexOf(expenses[i].name);
            prices[index] += expenses[i].price;
          }
          else {
            items.push(expenses[i].name);
            prices.push(expenses[i].price);
          }
        }
        var topFiveItems = new Array();
        var topFivePrices = new Array();
        for (let i = 0; i < items.length; i++) {
          if(topFiveItems.length < 6) {
            topFiveItems.push(items[i]);
            topFivePrices.push(prices[i]);
          }
          else {
            var small = prices[i];
            var ind = -1;
            for(let j = 0; j < topFivePrices.length; j++) {
              if(small > topFivePrices[j]) {
                small = topFivePrices[j];
                ind = j;
              }
            }
            if(j != -1) {
              topFivePrices[j] = prices[j];
              topFiveItems[j] = items[j];
            }
          }
        }
        var topFiveSortedItems = new Array();
        var topFiveSortedPrices = new Array();
        for(let j = 0; j < topFiveItems; j++) {
          for (let i = 0; i < topFiveItems; i++) {
            var high = -1;
            var ind = 0;
            if(topFiveSortedItems.includes(topFiveItems[i]) == false) {
              if(topFivePrices[i] > high) {
                high = topFiveItems[i];
                ind = i;
              }
            }
          }
          topFiveSortedItems.push(topFiveItems[ind]);
          topFiveSortedPrices.push(topFivePrices[ind]);
        }
        var topFiveSorted = [[],[]];
        for(let i = 0; i < topFiveSortedItems; i++) {
          topFiveSorted.push([topFiveSortedItems[i], topFiveSortedPrices[i]]);
        }
        con.end();
        return resolve(topFiveSorted);
    });
  })
}

async function buildGraph(data, categories, userID, date) {
    let res = await getExpensesFromUserAndDate(userID, date, data, categories);
    return res;
}




module.exports = {
  addExpenseToBudgets,
  getCategoriesByUser,
  buildGraph,



}
