const cron = require('node-cron');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const moment = require('moment');
let dbInfo = {
  host: "localhost",
  user: "root",
  password: "BudgetWise1234!",
  database : 'budgetwise'
};
let transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'budgetwisepurdue@gmail.com',
        pass: 'BudgetWise1234!'
    }
});

cron.schedule("*/10 * * * * *", function() {
  //console.log('New Loop Started in Cron');
  handleNotifications();
});

async function handleNotifications() {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users;`, (error, results, fields) => {
    if (error) {
      console.log(error);
      con.end();
    }
    looper(results);
    con.end();
  });
}

async function looper(usersArray) {
  for (let i = 0; i < usersArray.length; i++) {
    await sendNotification(usersArray[i]);
  }
}

async function sendNotification(user) {
  if (user.notifications == 1) {
      let previousNotificationDate = new Date(user.previous_notification);
      let previousNotificationDateSeconds = previousNotificationDate.getTime();
      let currentDate = new Date();
      let currentDateSeconds = currentDate.getTime();
      if (user.notification_frequency == 0) {
            let one_day=1000*60*60*24;
          let difference = currentDateSeconds - previousNotificationDateSeconds;
          if (difference >= one_day) {
            // send notification
            console.log(`Send notification for ${user.username}`);
            await getBudgets(user);
          }
      }
      else if (user.notification_frequency == 1) {
          let two_weeks=1000*60*60*24*14;
          let difference = currentDateSeconds - previousNotificationDateSeconds;
          if (difference >= two_weeks) {
              // send notification
            console.log(`Send notification for ${user.username}`);
            await getBudgets(user);
          }
      }
      else if (user.notification_frequency == 2) {
         let month=1000*60*60*24*30;
         let difference = currentDateSeconds - previousNotificationDateSeconds;
          if (difference >= month) {
                // send notification
            console.log(`Send notification for ${user.username}`);
            await getBudgets(user);
          }
      }
    }
}

function getBudgets(user) {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM budgets WHERE user=${mysql.escape(user.id)};`, (error, budgets, fields) => {
    if (error) {
      console.log(error);
      con.end();
      return;
    }
    con.end();
    getCategories(budgets, user);
    return;
  });
}

async function getCategories(budgets, user) {
  let con = mysql.createConnection(dbInfo);
  let newCategories = 0;
  con.query(`SELECT * FROM categories WHERE owner=${mysql.escape(user.id)};`, (error, categories, fields) => {
    if (error) {
      console.log(error);
      con.end();
      return;
    }
    getExpensesPerCategory(categories,budgets,user);
    con.end();
  });
}

async function getExpensesPerCategory(categories, budgets, user) {
  let con = mysql.createConnection(dbInfo);
  let newCategories = [];
  if (categories.length == 0) {
    con.end();
  }
  for (let i = 0; i < categories.length; i++) {
    con.query(`SELECT * FROM expenses WHERE category=${mysql.escape(categories[i].id)};`, (error, expenses, fields) => {
     if (error) {
        console.log(error);
        con.end();
        return;
      }
     let sum = Number(0);
     for (let j = 0; j < expenses.length; j++) {
        sum += Number(expenses[j].price);
      }
     let obj = {name: categories[i].name, total: sum};
      newCategories.push(obj);
      if (i == categories.length - 1) {
        buildEmail(newCategories, budgets, user);
        con.end();
      }
   });
  }
}

function buildEmail(categories, budgets, user) {
  let emailContent = "";
  if (budgets.length == 0) {
    emailContent = "<p>Hi,<br><br>You don't have any budgets created.<br></p><p>Best,</p><p>BudgetWise Team</p>";
  } else {
    let emailBegin = `<p>Hi,<br><br>Details about your budgets and categorial spending are below<br>`;
    let emailEnd = `</p><p>Best,</p><p>BudgetWise Team</p>`;
    for (let i = 0; i < budgets.length; i++) {
      emailBegin += `Budget Name: ${budgets[i].name} Budget Allowance: ${budgets[i].allowance} Budget Spenditure: ${budgets[i].amountSpent}<br>`;
    }
    for (let i = 0; i < categories.length; i++) {
      emailBegin += `Category Name: ${categories[i].name} Spend: ${categories[i].total}<br>`;
    }
    emailContent = emailBegin+emailEnd;
  }
  sendEmail(emailContent, user)
}

function sendEmail(emailContent, user) {
  const mailOptions = {
            from: 'budgetwisepurdue@gmail.com',
            to: user.email,
            subject: 'Budget Notifications for BudgetWise',
            html: emailContent
          };
          transporter.sendMail(mailOptions, function (err, info) {
             if(err)
               console.log(err)
             else
               console.log(info);
          });
          let con = mysql.createConnection(dbInfo);
          let currentDate = new Date();
          currentDate = Math.floor(currentDate.getTime()/1000);
          let mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
          con.query(`UPDATE users SET previous_notification='${mysqlTimestamp}' WHERE id='${user.id}';`, (error, results, fields) => {
            if (error) {
              console.log(error);
              con.end();
            }
          });
}